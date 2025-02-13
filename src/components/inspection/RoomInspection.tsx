import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { ArrowLeft, Camera, Image, Plus, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

type Condition = "bom" | "ruim" | "pessimo";

interface ChecklistItem {
  name: string;
  images: string[];
  condition: Condition;
  description?: string;
}

interface CategoryItem {
  category: string;
  name: string;
  subcategory?: string;
}

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
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  // New state for dialogs
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] =
    React.useState(false);
  const [newItemDialogOpen, setNewItemDialogOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [newItemName, setNewItemName] = React.useState("");

  // Fetch inspection categories for the room type
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("inspection_item_categories")
        .select("*")
        .eq("room_type", roomId)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      // Remove duplicates based on name
      const uniqueData = data?.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.name === item.name),
      );

      if (error) {
        console.error("Error fetching categories:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar categorias",
          description: "Não foi possível carregar os itens para vistoria.",
        });
        return;
      }

      if (!uniqueData || uniqueData.length === 0) {
        toast({
          variant: "destructive",
          title: "Sem itens para vistoria",
          description:
            "Não foram encontrados itens para este tipo de ambiente.",
        });
        return;
      }

      setCategories(uniqueData);
    };

    fetchCategories();
  }, [roomId, toast]);

  // Handle adding new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const { data, error } = await supabase
        .from("inspection_item_categories")
        .insert([
          {
            room_type: roomId,
            category: newCategoryName,
            name: newCategoryName,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, data]);
      setNewCategoryDialogOpen(false);
      setNewCategoryName("");

      toast({
        title: "Categoria adicionada",
        description: "Nova categoria criada com sucesso.",
      });
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar categoria",
        description: "Não foi possível criar a nova categoria.",
      });
    }
  };

  // Handle adding new item
  const handleAddItem = async () => {
    if (!newItemName.trim() || !selectedCategory) return;

    try {
      const { data, error } = await supabase
        .from("inspection_item_categories")
        .insert([
          {
            room_type: roomId,
            category: selectedCategory,
            name: newItemName,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, data]);
      setNewItemDialogOpen(false);
      setNewItemName("");
      setSelectedCategory("");

      toast({
        title: "Item adicionado",
        description: "Novo item criado com sucesso.",
      });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar item",
        description: "Não foi possível criar o novo item.",
      });
    }
  };

  // Handle deleting category
  const handleDeleteCategory = async (category: string) => {
    try {
      const { error } = await supabase
        .from("inspection_item_categories")
        .delete()
        .eq("room_type", roomId)
        .eq("category", category);

      if (error) throw error;

      setCategories(categories.filter((item) => item.category !== category));
      toast({
        title: "Categoria removida",
        description: "Categoria removida com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover categoria",
        description: "Não foi possível remover a categoria.",
      });
    }
  };

  // Handle deleting item
  const handleDeleteItem = async (itemName: string) => {
    try {
      const { error } = await supabase
        .from("inspection_item_categories")
        .delete()
        .eq("room_type", roomId)
        .eq("name", itemName);

      if (error) throw error;

      setCategories(categories.filter((item) => item.name !== itemName));
      toast({
        title: "Item removido",
        description: "Item removido com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover item",
        description: "Não foi possível remover o item.",
      });
    }
  };

  const handleConditionSelect = (itemName: string, condition: Condition) => {
    setChecklistItems((prev) => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        name: itemName,
        condition,
        images: prev[itemName]?.images || [],
      },
    }));
  };

  const handleDescriptionChange = (itemName: string, description: string) => {
    setChecklistItems((prev) => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        name: itemName,
        description,
        images: prev[itemName]?.images || [],
        condition: prev[itemName]?.condition || "bom",
      },
    }));
  };

  const handleImageUpload = async (
    itemName: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    try {
      setLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${roomId}/${itemName}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("inspection-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("inspection-images").getPublicUrl(filePath);

      setChecklistItems((prev) => ({
        ...prev,
        [itemName]: {
          ...prev[itemName],
          name: itemName,
          images: [...(prev[itemName]?.images || []), publicUrl],
          condition: prev[itemName]?.condition || "bom",
        },
      }));

      toast({
        title: "Imagem adicionada",
        description: "A imagem foi adicionada com sucesso.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar imagem",
        description: "Não foi possível enviar a imagem. Tente novamente.",
      });
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!user || !currentInspection) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Sessão inválida. Por favor, faça login novamente.",
      });
      return;
    }

    setLoading(true);
    try {
      // Save each item to the database
      for (const [itemName, itemData] of Object.entries(checklistItems)) {
        const { data: roomItem, error: roomItemError } = await supabase
          .from("room_items")
          .insert([
            {
              room_id: roomId,
              name: itemName,
              condition: itemData.condition,
              description: itemData.description || "",
              category:
                categories.find((cat) => cat.name === itemName)?.category ||
                "geral",
            },
          ])
          .select()
          .single();

        if (roomItemError) throw roomItemError;

        // Save images for this item
        if (itemData.images && itemData.images.length > 0) {
          const imageRecords = itemData.images.map((imageUrl) => ({
            item_id: roomItem.id,
            image_url: imageUrl,
          }));

          const { error: imagesError } = await supabase
            .from("item_images")
            .insert(imageRecords);

          if (imagesError) throw imagesError;
        }
      }

      toast({
        title: "Vistoria salva",
        description: "Os dados da vistoria foram salvos com sucesso.",
      });

      navigate("/property-environments");
    } catch (error) {
      console.error("Error saving inspection:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar os dados da vistoria.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Group categories by their main category
  const groupedCategories = categories.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, CategoryItem[]>,
  );

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
          <Card className="p-6 border-[#de9619]">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold capitalize">{roomId}</h2>
                <p className="text-gray-600">Vistoria detalhada do ambiente</p>
              </div>
              <Button
                onClick={() => setNewCategoryDialogOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </div>
          </Card>

          {Object.entries(groupedCategories).map(([category, items]) => (
            <Card key={category} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg capitalize font-black text-[#041a51]">
                  {category.replace("_", " ")}
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category);
                      setNewItemDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Item
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-6">
                {items.map((item) => {
                  const itemData = checklistItems[item.name] || {};
                  return (
                    <div
                      key={item.name}
                      className="space-y-4 pb-4 border-b border-gray-200 last:border-0"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <div className="text-[#3f4249]">
                            <p className="font-medium">{item.name}</p>
                            {itemData.condition && (
                              <Badge
                                variant="outline"
                                className={`mt-2 ${
                                  itemData.condition === "bom"
                                    ? "bg-green-100 text-green-800"
                                    : itemData.condition === "ruim"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {itemData.condition.charAt(0).toUpperCase() +
                                  itemData.condition.slice(1)}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 mt-1"
                            onClick={() => handleDeleteItem(item.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${
                              itemData.condition === "bom"
                                ? "bg-green-100 text-green-800 border-green-600"
                                : ""
                            }`}
                            onClick={() =>
                              handleConditionSelect(item.name, "bom")
                            }
                          >
                            Bom
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${
                              itemData.condition === "ruim"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-600"
                                : ""
                            }`}
                            onClick={() =>
                              handleConditionSelect(item.name, "ruim")
                            }
                          >
                            Ruim
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${
                              itemData.condition === "pessimo"
                                ? "bg-red-100 text-red-800 border-red-600"
                                : ""
                            }`}
                            onClick={() =>
                              handleConditionSelect(item.name, "pessimo")
                            }
                          >
                            Péssimo
                          </Button>
                        </div>
                      </div>
                      {/* Rest of the item content */}
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Adicione observações sobre este item..."
                          value={itemData.description || ""}
                          onChange={(e) =>
                            handleDescriptionChange(item.name, e.target.value)
                          }
                        />

                        <div className="flex gap-4 items-center text-[#57498c]">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e) => handleImageUpload(item.name, e)}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            ref={cameraInputRef}
                            onChange={(e) => handleImageUpload(item.name, e)}
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
                                alt={`${item.name} ${index + 1}`}
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
      {/* New Category Dialog */}
      <Dialog
        open={newCategoryDialogOpen}
        onOpenChange={setNewCategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Nome da categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewCategoryDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleAddCategory}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* New Item Dialog */}
      <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Nome do item"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewItemDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleAddItem}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
