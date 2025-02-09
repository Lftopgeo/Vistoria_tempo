import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type Inspection = Database["public"]["Tables"]["inspections"]["Row"];
type Room = Database["public"]["Tables"]["rooms"]["Row"];
type RoomItem = Database["public"]["Tables"]["room_items"]["Row"];

interface RoomSummary {
  name: string;
  totalItems: number;
  conditions: {
    bom: number;
    ruim: number;
    pessimo: number;
  };
  image: string | null;
  items: RoomItem[];
}

const getDefaultDescription = (itemName: string, condition: string) => {
  switch (condition) {
    case "bom":
      return `${itemName} em bom estado de conservação, sem danos aparentes.`;
    case "ruim":
      return `${itemName} apresenta sinais de desgaste e necessita de manutenção.`;
    case "pessimo":
      return `${itemName} com danos significativos, requer reparo ou substituição urgente.`;
    default:
      return "-";
  }
};

const InspectionSummary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [roomSummaries, setRoomSummaries] = useState<RoomSummary[]>([]);
  const [propertyAddress, setPropertyAddress] = useState("");
  const [propertyDetails, setPropertyDetails] = useState<Property | null>(null);
  const [inspectionDetails, setInspectionDetails] = useState<Inspection | null>(
    null,
  );

  useEffect(() => {
    const fetchInspectionData = async () => {
      if (!user) return;

      try {
        // Get current inspection with property details
        const { data: inspections, error: inspectionError } = await supabase
          .from("inspections")
          .select(
            `
            id,
            inspection_date,
            observations,
            property_id,
            properties:property_id(
              title,
              type,
              subtype,
              area,
              street,
              number,
              neighborhood,
              city,
              state,
              zip_code
            )
          `,
          )
          .eq("inspector_id", user.id)
          .eq("status", "in_progress")
          .order("created_at", { ascending: false });

        if (inspectionError) throw inspectionError;

        if (!inspections || inspections.length === 0) {
          toast({
            variant: "destructive",
            title: "Nenhuma vistoria em andamento",
            description: "Não foram encontradas vistorias em andamento.",
          });
          setLoading(false);
          return;
        }

        console.log("Found inspections:", inspections);

        const inspection = inspections[0];
        setInspectionDetails(inspection);

        const property = inspection.properties;
        if (!property) {
          toast({
            variant: "destructive",
            title: "Dados do imóvel não encontrados",
            description: "Não foi possível carregar os dados do imóvel.",
          });
          setLoading(false);
          return;
        }

        setPropertyDetails(property);

        // Set property address
        setPropertyAddress(
          `${property.street || ""}, ${property.number || ""} - ${property.neighborhood || ""}, ${property.city || ""} - ${property.state || ""}`,
        );

        // Get rooms with their items and images
        console.log("Fetching rooms for inspection:", inspection.id);

        const { data: rooms, error: roomsError } = await supabase
          .from("rooms")
          .select(
            `
            id,
            name,
            image_url,
            room_items!inner (id, name, condition, description),
            room_items!inner (item_images(image_url))
          `,
          )
          .eq("inspection_id", inspection.id);

        console.log("Found rooms:", rooms);

        if (roomsError) throw roomsError;

        if (!rooms || rooms.length === 0) {
          toast({
            title: "Nenhum ambiente encontrado",
            description:
              "Esta vistoria ainda não possui ambientes cadastrados.",
          });
          setLoading(false);
          return;
        }

        // Process room data
        const summaries = rooms.map((room) => {
          const roomItems = room.room_items || [];
          const conditions = roomItems.reduce(
            (
              acc: { bom: number; ruim: number; pessimo: number },
              item: any,
            ) => {
              if (item.condition) {
                acc[item.condition] = (acc[item.condition] || 0) + 1;
              }
              return acc;
            },
            { bom: 0, ruim: 0, pessimo: 0 },
          );

          // Get all images for this room's items
          const itemImages = roomItems.reduce((acc: string[], item: any) => {
            if (item.item_images) {
              acc.push(
                ...item.item_images
                  .map((img: any) => img.image_url)
                  .filter(Boolean),
              );
            }
            return acc;
          }, []);

          return {
            name: room.name,
            totalItems: roomItems.length,
            conditions,
            image:
              room.image_url || (itemImages.length > 0 ? itemImages[0] : null),
            items: roomItems,
            images: itemImages,
          };
        });

        setRoomSummaries(summaries);
      } catch (error) {
        console.error("Error fetching inspection data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados da vistoria.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInspectionData();
  }, [user, toast]);

  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Header with Logo
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("GEO", 20, 25);
    doc.setTextColor(255, 167, 38); // #FFA726
    doc.text("APP", 55, 25);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("Relatório de Vistoria", pageWidth - 20, 25, { align: "right" });

    // Reset text color
    doc.setTextColor(0, 0, 0);
    yPos = 50;

    // Property Details Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, yPos, pageWidth - 30, 60, 3, 3, "FD");

    yPos += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Detalhes do Imóvel", 20, yPos);
    doc.setFont(undefined, "normal");

    yPos += 10;
    doc.text(`Endereço: ${propertyAddress}`, 20, yPos);
    yPos += 10;
    doc.text(
      `Tipo: ${propertyDetails?.type || ""} - ${propertyDetails?.subtype || ""}`,
      20,
      yPos,
    );
    yPos += 10;
    doc.text(`Área: ${propertyDetails?.area || 0}m²`, 20, yPos);

    yPos += 20;

    // Inspection Info Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, yPos, pageWidth - 30, 40, 3, 3, "FD");

    yPos += 10;
    doc.setFont(undefined, "bold");
    doc.text("Informações da Vistoria", 20, yPos);
    doc.setFont(undefined, "normal");

    yPos += 10;
    doc.text(
      `Data: ${inspectionDetails?.inspection_date ? new Date(inspectionDetails.inspection_date).toLocaleDateString("pt-BR") : ""}`,
      20,
      yPos,
    );
    yPos += 10;
    doc.text(`Vistoriador: ${user?.email || ""}`, 20, yPos);

    yPos += 20;

    // Summary Table
    doc.setFont(undefined, "bold");
    doc.text("Resumo por Ambiente", 20, yPos);
    doc.setFont(undefined, "normal");
    yPos += 10;

    const summaryData = roomSummaries.map((room) => [
      room.name,
      room.totalItems,
      room.conditions.bom,
      room.conditions.ruim,
      room.conditions.pessimo,
    ]);

    doc.autoTable({
      startY: yPos,
      head: [
        [
          "Ambiente",
          "Total de Itens",
          "Bom Estado",
          "Estado Ruim",
          "Estado Péssimo",
        ],
      ],
      body: summaryData,
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [26, 26, 26],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Detailed Report for each room
    for (const room of roomSummaries) {
      // Add page break if needed
      if (yPos > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text(room.name, 20, yPos);
      yPos += 10;

      // Items table
      const itemsData = room.items.map((item) => [
        item.name,
        item.condition?.toUpperCase() || "",
        item.description || "-",
      ]);

      doc.autoTable({
        startY: yPos,
        head: [["Item", "Condição", "Observações"]],
        body: itemsData,
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
          fontSize: 9,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 30 },
          2: { cellWidth: 90 },
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        didDrawCell: function (data) {
          if (data.section === "body" && data.column.index === 1) {
            const condition = data.cell.raw?.toString().toLowerCase() || "";
            if (condition === "bom") {
              doc.setFillColor(200, 250, 200);
            } else if (condition === "ruim") {
              doc.setFillColor(255, 240, 200);
            } else if (condition === "pessimo") {
              doc.setFillColor(255, 200, 200);
            }
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height,
              "F",
            );
            doc.text(
              data.cell.raw?.toString() || "",
              data.cell.x + data.cell.width / 2,
              data.cell.y + data.cell.height / 2,
              {
                align: "center",
                baseline: "middle",
              },
            );
          }
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Save the PDF
    doc.save(`vistoria_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  const totalItems = roomSummaries.reduce(
    (acc, room) => acc + room.totalItems,
    0,
  );

  const totalConditions = roomSummaries.reduce(
    (acc, room) => ({
      bom: acc.bom + room.conditions.bom,
      ruim: acc.ruim + room.conditions.ruim,
      pessimo: acc.pessimo + room.conditions.pessimo,
    }),
    { bom: 0, ruim: 0, pessimo: 0 },
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-20 pb-24">
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2">Resumo da Vistoria</h1>
            <div className="text-gray-600">
              <p>{propertyAddress}</p>
              <p>
                Data:{" "}
                {inspectionDetails?.inspection_date
                  ? new Date(
                      inspectionDetails.inspection_date,
                    ).toLocaleDateString("pt-BR")
                  : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-green-800">
                  Total de Itens
                </h3>
                <span className="text-2xl font-semibold text-green-800">
                  {totalItems}
                </span>
              </div>
            </Card>

            <Card className="p-4 bg-gray-50 border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Condições</h3>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    {totalConditions.bom} Bom
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    {totalConditions.ruim} Ruim
                  </Badge>
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    {totalConditions.pessimo} Péssimo
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Resumo por Ambiente</h2>
            {roomSummaries.map((room, index) => (
              <Card key={index} className="p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-lg">
                    {room.image ? (
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{room.name}</h3>
                    <div className="flex gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800"
                      >
                        {room.conditions.bom} Bom
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800"
                      >
                        {room.conditions.ruim} Ruim
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-red-100 text-red-800"
                      >
                        {room.conditions.pessimo} Péssimo
                      </Badge>
                    </div>
                    <p className="text-gray-600">
                      {room.totalItems} itens vistoriados
                    </p>
                  </div>
                </div>

                {room.items && room.items.length > 0 && (
                  <div className="mt-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                            Item
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                            Condição
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                            Observações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {room.items.map((item, itemIndex) => (
                          <tr key={itemIndex}>
                            <td className="px-4 py-2 text-sm">{item.name}</td>
                            <td className="px-4 py-2 text-sm">
                              <Badge
                                variant="outline"
                                className={`${
                                  item.condition === "bom"
                                    ? "bg-green-100 text-green-800"
                                    : item.condition === "ruim"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.condition?.charAt(0).toUpperCase() +
                                  item.condition?.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {item.description ||
                                getDefaultDescription(
                                  item.name,
                                  item.condition,
                                )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto grid grid-cols-2 gap-4">
          <Button
            onClick={async () => {
              if (!inspectionDetails?.id) return;

              try {
                // Atualizar status da vistoria para concluída
                const { error: updateError } = await supabase
                  .from("inspections")
                  .update({ status: "completed" })
                  .eq("id", inspectionDetails.id);

                if (updateError) throw updateError;

                generatePDF();

                toast({
                  title: "Vistoria finalizada",
                  description:
                    "A vistoria foi concluída e o relatório foi gerado.",
                });

                navigate("/dashboard");
              } catch (error) {
                console.error("Error finalizing inspection:", error);
                toast({
                  variant: "destructive",
                  title: "Erro ao finalizar vistoria",
                  description:
                    "Ocorreu um erro ao finalizar a vistoria. Tente novamente.",
                });
              }
            }}
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white"
          >
            <FileText className="h-4 w-4" />
            Finalizar e Visualizar
          </Button>
          <Button
            onClick={() => {
              try {
                generatePDF();
                toast({
                  title: "PDF gerado com sucesso",
                  description: "O relatório foi baixado para o seu computador.",
                });
              } catch (error) {
                console.error("Error generating PDF:", error);
                toast({
                  variant: "destructive",
                  title: "Erro ao gerar PDF",
                  description:
                    "Ocorreu um erro ao gerar o relatório. Tente novamente.",
                });
              }
            }}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InspectionSummary;
