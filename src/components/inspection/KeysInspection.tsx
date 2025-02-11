import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft, Plus, Check } from "lucide-react";

interface ChecklistItem {
  id: string;
  name: string;
  condition: "bom" | "ruim" | "pessimo";
  quantity: number;
  description?: string;
}

const defaultItems = [
  {
    category: "Chaves",
    items: [
      {
        id: "1",
        name: "Chave Principal",
        condition: "bom" as const,
        quantity: 2,
      },
      {
        id: "2",
        name: "Chave Reserva",
        condition: "bom" as const,
        quantity: 1,
      },
      {
        id: "3",
        name: "Chave do Portão",
        condition: "bom" as const,
        quantity: 1,
      },
      {
        id: "4",
        name: "Chave da Garagem",
        condition: "bom" as const,
        quantity: 1,
      },
    ],
  },
  {
    category: "Controles",
    items: [
      {
        id: "5",
        name: "Controle do Portão",
        condition: "bom" as const,
        quantity: 1,
      },
      {
        id: "6",
        name: "Controle do Alarme",
        condition: "bom" as const,
        quantity: 1,
      },
      {
        id: "7",
        name: "Controle da Garagem",
        condition: "bom" as const,
        quantity: 1,
      },
    ],
  },
];

const KeysInspection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(defaultItems);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Chaves");

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
                quantity: newItemQuantity,
              },
            ],
          };
        }
        return cat;
      }),
    );

    setNewItemName("");
    setNewItemQuantity(1);
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

  const handleQuantityChange = (
    categoryIndex: number,
    itemIndex: number,
    quantity: number,
  ) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items[itemIndex].quantity = quantity;
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
          Chaves e Controles
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
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <Label>Quantidade:</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              categoryIndex,
                              itemIndex,
                              parseInt(e.target.value),
                            )
                          }
                          className="w-20"
                          min={1}
                        />
                      </div>
                    </div>
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
              <div className="w-32 space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(parseInt(e.target.value))}
                  min={1}
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
            Concluir Vistoria de Chaves
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KeysInspection;
