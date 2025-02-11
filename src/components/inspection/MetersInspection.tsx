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
  reading: string;
  number: string;
  description?: string;
}

const defaultItems = [
  {
    category: "Medidores",
    items: [
      {
        id: "1",
        name: "Medidor de Água",
        condition: "bom" as const,
        reading: "0",
        number: "123456",
      },
      {
        id: "2",
        name: "Medidor de Luz",
        condition: "bom" as const,
        reading: "0",
        number: "789012",
      },
      {
        id: "3",
        name: "Medidor de Gás",
        condition: "bom" as const,
        reading: "0",
        number: "345678",
      },
    ],
  },
];

const MetersInspection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(defaultItems);
  const [newItemName, setNewItemName] = useState("");
  const [newItemReading, setNewItemReading] = useState("");
  const [newItemNumber, setNewItemNumber] = useState("");

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: [
          ...cat.items,
          {
            id: Date.now().toString(),
            name: newItemName,
            condition: "bom" as const,
            reading: newItemReading,
            number: newItemNumber,
          },
        ],
      })),
    );

    setNewItemName("");
    setNewItemReading("");
    setNewItemNumber("");
  };

  const handleConditionChange = (
    itemIndex: number,
    condition: "bom" | "ruim" | "pessimo",
  ) => {
    const newCategories = [...categories];
    newCategories[0].items[itemIndex].condition = condition;
    setCategories(newCategories);
  };

  const handleReadingChange = (itemIndex: number, reading: string) => {
    const newCategories = [...categories];
    newCategories[0].items[itemIndex].reading = reading;
    setCategories(newCategories);
  };

  const handleNumberChange = (itemIndex: number, number: string) => {
    const newCategories = [...categories];
    newCategories[0].items[itemIndex].number = number;
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

        <h2 className="text-3xl font-medium text-black mb-8">Medidores</h2>

        <div className="space-y-6">
          {categories.map((category) => (
            <Card key={category.category} className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {category.category}
              </h3>
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 border-b pb-4"
                  >
                    <div className="flex items-center justify-between">
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
                            handleConditionChange(itemIndex, "bom")
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
                            handleConditionChange(itemIndex, "ruim")
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
                            handleConditionChange(itemIndex, "pessimo")
                          }
                        >
                          Péssimo
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Leitura Atual</Label>
                        <Input
                          value={item.reading}
                          onChange={(e) =>
                            handleReadingChange(itemIndex, e.target.value)
                          }
                          placeholder="Digite a leitura atual"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Número do Medidor</Label>
                        <Input
                          value={item.number}
                          onChange={(e) =>
                            handleNumberChange(itemIndex, e.target.value)
                          }
                          placeholder="Digite o número do medidor"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              Adicionar Novo Medidor
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Medidor</Label>
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Digite o nome do medidor"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Leitura Inicial</Label>
                  <Input
                    value={newItemReading}
                    onChange={(e) => setNewItemReading(e.target.value)}
                    placeholder="Digite a leitura inicial"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número do Medidor</Label>
                  <Input
                    value={newItemNumber}
                    onChange={(e) => setNewItemNumber(e.target.value)}
                    placeholder="Digite o número do medidor"
                  />
                </div>
              </div>
              <Button
                onClick={handleAddItem}
                className="bg-red-600 hover:bg-red-700 w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Medidor
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
            Concluir Vistoria de Medidores
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MetersInspection;
