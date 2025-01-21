import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { ArrowLeft, Camera, Image } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

type Condition = "bom" | "ruim" | "pessimo";

interface ChecklistItem {
  name: string;
  images: string[];
  condition: Condition;
  description?: string;
}

const roomData = {
  "sala-de-estar": {
    name: "Sala de Estar",
    description: "Espaço aconchegante",
    image:
      "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=500",
    checklist: {
      furniture: [
        "Sofá em bom estado",
        "Mesa de centro intacta",
        "Rack da TV sem arranhões",
        "Cortinas limpas e funcionando",
        "Tapete sem manchas",
        "Almofadas em bom estado",
      ],
      finishing: [
        "Pintura sem manchas",
        "Piso sem arranhões",
        "Rodapés alinhados",
        "Acabamento do teto regular",
        "Janelas funcionando",
        "Portas sem problemas",
      ],
      lighting: [
        "Lâmpadas funcionando",
        "Interruptores funcionando",
        "Iluminação adequada",
      ],
      electrical: [
        "Tomadas funcionando",
        "Disjuntores identificados",
        "Fiação aparente em ordem",
      ],
    },
  },
  cozinha: {
    name: "Cozinha",
    description: "Moderna e equipada",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=500",
    checklist: {
      appliances: [
        "Fogão funcionando",
        "Geladeira em ordem",
        "Microondas operacional",
        "Pia sem vazamentos",
      ],
      cabinets: [
        "Armários em bom estado",
        "Gavetas deslizando",
        "Portas alinhadas",
      ],
      countertops: ["Bancadas sem manchas", "Revestimentos intactos"],
    },
  },
  quarto: {
    name: "Quarto",
    description: "Confortável e amplo",
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=500",
    checklist: {
      furniture: [
        "Cama em bom estado",
        "Guarda-roupa funcionando",
        "Criado-mudo intacto",
      ],
      comfort: [
        "Climatização adequada",
        "Isolamento acústico",
        "Iluminação natural",
      ],
    },
  },
  banheiro: {
    name: "Banheiro",
    description: "Clean e funcional",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=500",
    checklist: {
      fixtures: [
        "Vaso sanitário funcionando",
        "Pia sem vazamentos",
        "Chuveiro em ordem",
      ],
      features: ["Espelho intacto", "Box sem problemas", "Ventilação adequada"],
    },
  },
};

const RoomInspection = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [currentInspection, setCurrentInspection] = React.useState<
    string | null
  >(null);
  const [checklistItems, setChecklistItems] = React.useState<
    Record<string, ChecklistItem>
  >({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const room = roomData[roomId as keyof typeof roomData];

  useEffect(() => {
    const fetchCurrentInspection = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("inspections")
        .select("id")
        .eq("inspector_id", user.id)
        .eq("status", "in_progress")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching current inspection:", error);
        return;
      }

      setCurrentInspection(data.id);
    };

    fetchCurrentInspection();
  }, [user]);

  if (!room) {
    return <div>Ambiente não encontrado</div>;
  }

  const handleConditionSelect = (item: string, condition: Condition) => {
    setChecklistItems((prev) => ({
      ...prev,
      [item]: {
        ...prev[item],
        name: item,
        condition,
        images: prev[item]?.images || [],
        description: prev[item]?.description,
      },
    }));
  };

  const handleDescriptionChange = (item: string, description: string) => {
    setChecklistItems((prev) => ({
      ...prev,
      [item]: {
        ...prev[item],
        name: item,
        description,
        images: prev[item]?.images || [],
        condition: prev[item]?.condition || "bom",
      },
    }));
  };

  const handleImageUpload = async (
    item: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("inspection-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("inspection-images").getPublicUrl(filePath);

      setChecklistItems((prev) => ({
        ...prev,
        [item]: {
          ...prev[item],
          name: item,
          images: [...(prev[item]?.images || []), publicUrl],
          condition: prev[item]?.condition || "bom",
        },
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload da imagem",
        description: "Tente novamente.",
      });
    }
  };

  const handleSave = async () => {
    if (!currentInspection || !user) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Nenhuma inspeção ativa encontrada.",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Iniciando salvamento da sala...");

      // 1. Criar a sala
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .insert([
          {
            inspection_id: currentInspection,
            name: room.name,
            description: room.description,
            image_url: room.image,
          },
        ])
        .select()
        .single();

      if (roomError) throw roomError;
      console.log("Sala criada:", roomData);

      // 2. Preparar os itens para inserção
      const itemsToInsert = Object.entries(checklistItems).map(
        ([name, item]) => ({
          room_id: roomData.id,
          category: "general",
          name,
          condition: item.condition,
          description: item.description || "",
        }),
      );

      // 3. Inserir todos os itens de uma vez
      const { data: insertedItems, error: itemsError } = await supabase
        .from("room_items")
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw itemsError;
      console.log("Itens inseridos:", insertedItems);

      // 4. Preparar e inserir as imagens
      const imagesToInsert = insertedItems.flatMap((roomItem) => {
        const item = checklistItems[roomItem.name];
        return (item?.images || []).map((image_url) => ({
          item_id: roomItem.id,
          image_url,
        }));
      });

      if (imagesToInsert.length > 0) {
        console.log("Inserindo imagens:", imagesToInsert);
        const { error: imagesError } = await supabase
          .from("item_images")
          .insert(imagesToInsert);

        if (imagesError) throw imagesError;
      }

      toast({
        title: "Vistoria salva",
        description: "A vistoria do ambiente foi salva com sucesso.",
      });

      navigate("/property-environments");
    } catch (error: any) {
      console.error("Erro ao salvar vistoria:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar vistoria",
        description: error.message || "Ocorreu um erro ao salvar a vistoria.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </button>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex gap-4 items-start">
              <img
                src={room.image}
                alt={room.name}
                className="w-32 h-32 object-cover rounded-lg"
              />
              <div>
                <h2 className="text-2xl font-semibold">{room.name}</h2>
                <p className="text-gray-600">{room.description}</p>
              </div>
            </div>
          </Card>

          {Object.entries(room.checklist).map(([category, items]) => (
            <Card key={category} className="p-6">
              <h3 className="text-lg font-semibold capitalize mb-4">
                {category}
              </h3>
              <div className="space-y-6">
                {items.map((item) => {
                  const itemData = checklistItems[item] || {};
                  return (
                    <div
                      key={item}
                      className="space-y-4 pb-4 border-b border-gray-200 last:border-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item}</p>
                          {itemData.condition && (
                            <Badge
                              variant="outline"
                              className={`mt-2 ${itemData.condition === "bom" ? "bg-green-100 text-green-800" : itemData.condition === "ruim" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                            >
                              {itemData.condition.charAt(0).toUpperCase() +
                                itemData.condition.slice(1)}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${itemData.condition === "bom" ? "bg-green-100 text-green-800 border-green-600" : ""}`}
                            onClick={() => handleConditionSelect(item, "bom")}
                          >
                            Bom
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${itemData.condition === "ruim" ? "bg-yellow-100 text-yellow-800 border-yellow-600" : ""}`}
                            onClick={() => handleConditionSelect(item, "ruim")}
                          >
                            Ruim
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${itemData.condition === "pessimo" ? "bg-red-100 text-red-800 border-red-600" : ""}`}
                            onClick={() =>
                              handleConditionSelect(item, "pessimo")
                            }
                          >
                            Péssimo
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Textarea
                          placeholder="Adicione observações sobre este item..."
                          value={itemData.description || ""}
                          onChange={(e) =>
                            handleDescriptionChange(item, e.target.value)
                          }
                        />

                        <div className="flex gap-4 items-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e) => handleImageUpload(item, e)}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            ref={cameraInputRef}
                            onChange={(e) => handleImageUpload(item, e)}
                          />

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Image className="h-4 w-4 mr-2" />
                            Galeria
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cameraInputRef.current?.click()}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Câmera
                          </Button>
                        </div>

                        {itemData.images && itemData.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {itemData.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`${item} ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto">
          <Button
            onClick={handleSave}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar Vistoria"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomInspection;
