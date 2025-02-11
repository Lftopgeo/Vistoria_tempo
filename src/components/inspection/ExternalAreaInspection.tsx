import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ArrowLeft, Plus, Check } from "lucide-react";

interface ChecklistItem {
  id: string;
  name: string;
  condition: "bom" | "ruim" | "pessimo";
  description?: string;
}

const defaultItems = [
  {
    category: "Jardim",
    items: [
      { id: "1", name: "Grama", condition: "bom" as const },
      { id: "2", name: "Plantas", condition: "bom" as const },
      { id: "3", name: "Sistema de Irrigação", condition: "bom" as const },
      { id: "4", name: "Cercas Vivas", condition: "bom" as const },
    ],
  },
  {
    category: "Piscina",
    items: [
      { id: "5", name: "Revestimento", condition: "bom" as const },
      { id: "6", name: "Filtro", condition: "bom" as const },
      { id: "7", name: "Bomba", condition: "bom" as const },
      { id: "8", name: "Iluminação", condition: "bom" as const },
    ],
  },
];

const ExternalAreaInspection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(defaultItems);
  const [newItemName, setNewItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Jardim");

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.category === selectedCategory) {
          return {
            ...cat,
            items: [
              ...cat.items,
              {
                id: Date.now().toString(),
                name: newItemName,
                condition: "bom" as const,
              },
            ],
          };
        }
        return cat;
      }),
    );

    setNewItemName("");
  };

  const handleConditionChange = (
    categoryIndex: number,
    itemIndex: number,
    condition: "bom" | "ruim" | "pessimo",
  ) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items[itemIndex].condition = condition;
    setCategories(newCategories);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-3xl w-4/5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </button>

        <h2 className="text-3xl font-medium text-black mb-8">
          Ambiente Externo
        </h2>

        <div className="space-y-6">
          {categories.map((category, categoryIndex) => (
            <Card key={category.category} className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {category.category}
              </h3>
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <span className="font-medium">{item.name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={
                          item.condition === "bom" ? "default" : "outline"
                        }
                        className={
                          item.condition === "bom" ? "bg-green-600" : ""
                        }
                        onClick={() =>
                          handleConditionChange(categoryIndex, itemIndex, "bom")
                        }
                      >
                        Bom
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          item.condition === "ruim" ? "default" : "outline"
                        }
                        className={
                          item.condition === "ruim" ? "bg-yellow-600" : ""
                        }
                        onClick={() =>
                          handleConditionChange(
                            categoryIndex,
                            itemIndex,
                            "ruim",
                          )
                        }
                      >
                        Ruim
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          item.condition === "pessimo" ? "default" : "outline"
                        }
                        className={
                          item.condition === "pessimo" ? "bg-red-600" : ""
                        }
                        onClick={() =>
                          handleConditionChange(
                            categoryIndex,
                            itemIndex,
                            "pessimo",
                          )
                        }
                      >
                        Péssimo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Adicionar Novo Item</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>Categoria</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-2">
                <Label>Nome do Item</Label>
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Digite o nome do item"
                />
              </div>
              <Button
                onClick={handleAddItem}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => navigate("/property-environments")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            Concluir Vistoria Externa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExternalAreaInspection;
