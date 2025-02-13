import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getRoomCategories } from "@/lib/roomCategories";
import { Database } from "@/types/supabase";

type RoomItem = Database["public"]["Tables"]["room_items"]["Row"];
type Condition = "bom" | "ruim" | "pessimo";

interface ChecklistItem {
  name: string;
  images: string[];
  condition: Condition;
  description?: string;
  category: string;
}

interface Category {
  id: string;
  label: string;
  items: string[];
}

const RoomInspection = () => {
  const navigate = useNavigate();
  const { roomId: roomName } = useParams();
  const [roomId, setRoomId] = React.useState<string | null>(null);
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

  const defaultCategories: Category[] = getRoomCategories(roomName || "");
  const [categories, setCategories] =
    React.useState<Category[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = React.useState(
    defaultCategories[0]?.id || "eletrica",
  );
  const [newItemDialogOpen, setNewItemDialogOpen] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState("");

  // Fetch predefined items from the database
  useEffect(() => {
    const fetchPredefinedItems = async () => {
      if (!roomName) return;

      try {
        const { data, error } = await supabase
          .from("inspection_item_categories")
          .select("*")
          .eq("room_type", roomName.toLowerCase());

        if (error) throw error;

        // Update categories with predefined items
        setCategories((prev) =>
          prev.map((category) => ({
            ...category,
            items:
              data
                ?.filter((item) => item.category === category.id)
                .map((item) => item.name) || [],
          })),
        );
      } catch (error) {
        console.error("Error fetching predefined items:", error);
      }
    };

    fetchPredefinedItems();
  }, [roomName]);

  useEffect(() => {
    const fetchInspectionData = async () => {
      if (!user || !roomName) return;

      try {
        setLoading(true);

        // Get current inspection
        const { data: inspection, error: inspectionError } = await supabase
          .from("inspections")
          .select("id")
          .eq("inspector_id", user.id)
          .eq("status", "in_progress")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (inspectionError) throw inspectionError;

        setCurrentInspection(inspection.id);

        // Get room ID first
        const { data: rooms, error: roomError } = await supabase
          .from("rooms")
          .select("id")
          .eq("inspection_id", inspection.id)
          .eq("name", roomName)
          .limit(1);

        if (roomError) throw roomError;
        if (!rooms || rooms.length === 0) throw new Error("Room not found");

        const room = rooms[0];
        setRoomId(room.id);

        // Get room items
        const { data: items, error: itemsError } = await supabase
          .from("room_items")
          .select("*")
          .eq("room_id", room.id)
          .order("created_at", { ascending: true });

        if (itemsError) throw itemsError;

        const itemsMap: Record<string, ChecklistItem> = {};
        items?.forEach((item: RoomItem) => {
          itemsMap[item.id] = {
            name: item.name,
            condition: item.condition as Condition,
            description: item.description || "",
            images: [],
            category: item.category,
          };
        });

        setChecklistItems(itemsMap);
      } catch (error) {
        console.error("Error fetching room data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados do ambiente.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInspectionData();
  }, [user, roomName]);

  const handleAddItem = async () => {
    if (!currentInspection || !roomId || !newItemName || !selectedCategory)
      return;

    try {
      const { data: item, error } = await supabase
        .from("room_items")
        .insert([
          {
            room_id: roomId,
            name: newItemName,
            category: selectedCategory,
            condition: "bom" as const,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (item) {
        setChecklistItems((prev) => ({
          ...prev,
          [item.id]: {
            name: item.name,
            condition: item.condition as Condition,
            description: "",
            images: [],
            category: item.category,
          },
        }));
      }

      setNewItemName("");
      setNewItemDialogOpen(false);
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar item",
        description: "Ocorreu um erro ao adicionar o item.",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("room_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      const newItems = { ...checklistItems };
      delete newItems[itemId];
      setChecklistItems(newItems);

      toast({
        title: "Item removido",
        description: "O item foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover item",
        description: "Ocorreu um erro ao remover o item.",
      });
    }
  };

  const handleUpdateItem = async (
    itemId: string,
    data: Partial<ChecklistItem>,
  ) => {
    try {
      const { error } = await supabase
        .from("room_items")
        .update(data)
        .eq("id", itemId);

      if (error) throw error;

      setChecklistItems((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], ...data },
      }));
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar item",
        description: "Ocorreu um erro ao atualizar o item.",
      });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-4 right-4 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setNewItemDialogOpen(true)}
                className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adicionar novo item</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

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
            <Tabs defaultValue={categories[0]?.id || "eletrica"}>
              <TabsList className="mb-4">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <div className="space-y-4">
                    {Object.entries(checklistItems)
                      .filter(([_, item]) => item.category === category.id)
                      .map(([id, item]) => (
                        <Card key={id} className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-gray-500">
                                  {item.description}
                                </p>
                              </div>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => handleDeleteItem(id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Remover item</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Textarea
                              placeholder="Observações..."
                              value={item.description || ""}
                              onChange={(e) => {
                                handleUpdateItem(id, {
                                  description: e.target.value,
                                });
                              }}
                              className="mt-2"
                            />
                            <div className="flex gap-2">
                              {[
                                {
                                  value: "bom",
                                  label: "Bom",
                                  className:
                                    "bg-green-100 hover:bg-green-200 text-green-700",
                                },
                                {
                                  value: "ruim",
                                  label: "Ruim",
                                  className:
                                    "bg-yellow-100 hover:bg-yellow-200 text-yellow-700",
                                },
                                {
                                  value: "pessimo",
                                  label: "Péssimo",
                                  className:
                                    "bg-red-100 hover:bg-red-200 text-red-700",
                                },
                              ].map(({ value, label, className }) => (
                                <Button
                                  key={value}
                                  variant={
                                    item.condition === value
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => {
                                    handleUpdateItem(id, {
                                      condition: value as Condition,
                                    });
                                  }}
                                  className={
                                    item.condition === value
                                      ? className
                                      : undefined
                                  }
                                >
                                  {label}
                                </Button>
                              ))}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        if (fileInputRef.current) {
                                          fileInputRef.current.click();
                                        }
                                      }}
                                    >
                                      <Image className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Adicionar imagem da galeria</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        if (cameraInputRef.current) {
                                          cameraInputRef.current.click();
                                        }
                                      }}
                                    >
                                      <Camera className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Tirar foto</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  // Handle file upload
                                }}
                              />
                              <input
                                type="file"
                                ref={cameraInputRef}
                                className="hidden"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => {
                                  // Handle camera capture
                                }}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto">
          <Button
            onClick={() => navigate("/inspection-summary")}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Salvar e Continuar
          </Button>
        </div>
      </div>

      <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {(categories.find((c) => c.id === selectedCategory)?.items
                  .length ?? 0) > 0 ? (
                  <Select value={newItemName} onValueChange={setNewItemName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o item" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .find((c) => c.id === selectedCategory)
                        ?.items.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Nome do item"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewItemDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddItem}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomInspection;
