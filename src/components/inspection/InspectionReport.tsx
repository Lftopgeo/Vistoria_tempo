import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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
type ItemImage = Database["public"]["Tables"]["item_images"]["Row"];

interface RoomSummary {
  name: string;
  totalItems: number;
  conditions: {
    bom: number;
    ruim: number;
    pessimo: number;
  };
  image: string;
  items?: RoomItem[];
  images?: ItemImage[];
}

const InspectionReport = () => {
  const navigate = useNavigate();
  const { inspectionId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);

  useEffect(() => {
    const fetchInspectionData = async () => {
      if (!user) return;

      try {
        // Get inspection with property details
        const { data: inspection, error: inspectionError } = await supabase
          .from("inspections")
          .select(
            `
            *,
            properties:property_id(
              *
            )
          `,
          )
          .eq("id", inspectionId)
          .single();

        if (inspectionError) throw inspectionError;

        setInspection(inspection);
        setProperty(inspection.properties);

        // Get rooms with their items and images
        const { data: rooms, error: roomsError } = await supabase
          .from("rooms")
          .select(
            `
            *,
            room_items(*, item_images(*))
          `,
          )
          .eq("inspection_id", inspectionId);

        if (roomsError) throw roomsError;

        // Process room data
        const summaries = rooms.map((room: any) => {
          const conditions = room.room_items.reduce(
            (acc: any, item: any) => {
              acc[item.condition] = (acc[item.condition] || 0) + 1;
              return acc;
            },
            { bom: 0, ruim: 0, pessimo: 0 },
          );

          return {
            name: room.name,
            totalItems: room.room_items.length,
            conditions,
            image: room.image_url,
            items: room.room_items,
          };
        });

        setRooms(summaries);
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
  }, [user, inspectionId]);

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
    doc.text(
      `Endereço: ${property?.street}, ${property?.number} - ${property?.neighborhood}, ${property?.city} - ${property?.state}`,
      20,
      yPos,
    );
    yPos += 10;
    doc.text(`Tipo: ${property?.type} - ${property?.subtype || ""}`, 20, yPos);
    yPos += 10;
    doc.text(`Área: ${property?.area}m²`, 20, yPos);

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
      `Data: ${new Date(inspection?.inspection_date || "").toLocaleDateString(
        "pt-BR",
      )}`,
      20,
      yPos,
    );
    yPos += 10;
    doc.text(`Vistoriador: ${user?.email}`, 20, yPos);

    yPos += 20;

    // Summary Table
    doc.setFont(undefined, "bold");
    doc.text("Resumo por Ambiente", 20, yPos);
    doc.setFont(undefined, "normal");
    yPos += 10;

    const summaryData = rooms.map((room) => [
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
    for (const room of rooms) {
      // Add page break if needed
      if (yPos > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text(room.name, 20, yPos);
      yPos += 10;

      // Items table
      const itemsData = room.items?.map((item) => [
        item.name,
        item.condition.toUpperCase(),
        item.description || "-",
      ]);

      doc.autoTable({
        startY: yPos,
        head: [["Item", "Condição", "Observações"]],
        body: itemsData || [],
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
            const condition = data.cell.raw.toString().toLowerCase();
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
              data.cell.raw.toString(),
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

  const totalItems = rooms.reduce((acc, room) => acc + room.totalItems, 0);
  const totalConditions = rooms.reduce(
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
            <h1 className="text-2xl font-semibold mb-2">
              Relatório da Vistoria
            </h1>
            <div className="text-gray-600">
              <p>
                {property?.street}, {property?.number} -{" "}
                {property?.neighborhood}, {property?.city} - {property?.state}
              </p>
              <p>
                Data:{" "}
                {new Date(inspection?.inspection_date || "").toLocaleDateString(
                  "pt-BR",
                )}{" "}
                às{" "}
                {new Date(inspection?.inspection_date || "").toLocaleTimeString(
                  "pt-BR",
                )}
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
            {rooms.map((room, index) => (
              <Card key={index} className="p-4">
                <div className="flex gap-4">
                  {room.image && (
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
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
                                {item.condition.charAt(0).toUpperCase() +
                                  item.condition.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {item.description || "-"}
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
            onClick={() => generatePDF()}
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white"
          >
            <FileText className="h-4 w-4" />
            Visualizar
          </Button>
          <Button
            onClick={() => generatePDF()}
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

export default InspectionReport;
