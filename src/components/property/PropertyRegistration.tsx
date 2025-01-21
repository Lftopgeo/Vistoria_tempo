import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { ArrowLeft, Building, Home, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const propertyTypes = [
  {
    type: "Casa",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80",
    subtypes: ["Casa Térrea", "Sobrado", "Chalé", "Casa em Condomínio"],
  },
  {
    type: "Apartamento",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    subtypes: ["Studio", "Kitnet", "Cobertura", "Duplex", "Triplex"],
  },
  {
    type: "Terreno",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80",
    subtypes: ["Terreno Urbano", "Terreno Rural", "Lote", "Chácara"],
  },
  {
    type: "Sala Comercial",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
    subtypes: ["Escritório", "Loja", "Galpão", "Consultório"],
  },
];

const PropertyRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState("");
  const [selectedSubtype, setSelectedSubtype] = React.useState("");
  const [formData, setFormData] = React.useState({
    inspectionId: "",
    inspectedName: "",
    ownerName: "",
    title: "",
    description: "",
    area: "",
    value: "",
    registrationNumber: "",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!selectedType || !selectedSubtype) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione o tipo e subtipo do imóvel",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert([
          {
            title: formData.title || selectedType,
            type: selectedType,
            subtype: selectedSubtype,
            area: Number(formData.area) || 0,
            value: Number(formData.value) || 0,
            registration_number: formData.registrationNumber,
            street: formData.address.street,
            number: formData.address.number,
            complement: formData.address.complement,
            neighborhood: formData.address.neighborhood,
            city: formData.address.city,
            state: formData.address.state,
            zip_code: formData.address.zipCode,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (propertyError) throw propertyError;

      const { error: inspectionError } = await supabase
        .from("inspections")
        .insert([
          {
            property_id: property.id,
            inspector_id: user.id,
            inspection_date: new Date().toISOString(),
            status: "in_progress",
            observations: formData.description,
          },
        ]);

      if (inspectionError) throw inspectionError;

      toast({
        title: "Sucesso",
        description: "Imóvel cadastrado com sucesso!",
      });

      navigate("/property-environments");
    } catch (error: any) {
      console.error("Error saving property:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Erro ao cadastrar imóvel",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentSubtypes =
    propertyTypes.find((p) => p.type === selectedType)?.subtypes || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </button>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Building className="mr-2 h-6 w-6" />
                Cadastro de Imóvel
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {propertyTypes.map((type) => (
                  <div
                    key={type.type}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedType === type.type ? "border-red-600 shadow-lg" : "border-transparent hover:border-gray-300"}`}
                    onClick={() => {
                      setSelectedType(type.type);
                      setSelectedSubtype("");
                    }}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={type.image}
                        alt={type.type}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {type.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedType && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Selecione o Subtipo
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentSubtypes.map((subtype) => (
                      <div
                        key={subtype}
                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${selectedSubtype === subtype ? "border-red-600 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                        onClick={() => setSelectedSubtype(subtype)}
                      >
                        <span className="text-sm font-medium">{subtype}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center text-[#0d1fa8]">
                <Home className="mr-2 h-5 w-5" />
                Informações Básicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="inspectionId">ID da Vistoria</Label>
                  <Input
                    id="inspectionId"
                    placeholder="Digite o ID da vistoria"
                    value={formData.inspectionId}
                    onChange={(e) =>
                      setFormData({ ...formData, inspectionId: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspectedName">Nome do Vistoriado</Label>
                  <Input
                    id="inspectedName"
                    placeholder="Digite o nome do vistoriado"
                    value={formData.inspectedName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inspectedName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">Proprietário do Imóvel</Label>
                  <Input
                    id="ownerName"
                    placeholder="Digite o nome do proprietário"
                    value={formData.ownerName}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">
                    Número de Matrícula
                  </Label>
                  <Input
                    id="registrationNumber"
                    placeholder="Digite o número de matrícula"
                    value={formData.registrationNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registrationNumber: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    placeholder="Ex: 100"
                    value={formData.area}
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Valor (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="Ex: 500000"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva as características do imóvel..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Endereço
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Rua</Label>
                  <Input
                    placeholder="Nome da rua"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          street: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input
                      placeholder="Nº"
                      value={formData.address.number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            number: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Complemento</Label>
                    <Input
                      placeholder="Apto, Sala..."
                      value={formData.address.complement}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            complement: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input
                    placeholder="Nome do bairro"
                    value={formData.address.neighborhood}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          neighborhood: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    placeholder="Nome da cidade"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    placeholder="UF"
                    maxLength={2}
                    value={formData.address.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          state: e.target.value.toUpperCase(),
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    placeholder="00000-000"
                    value={formData.address.zipCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          zipCode: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Cadastrar Imóvel"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PropertyRegistration;
