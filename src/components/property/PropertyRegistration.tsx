import React, { useState } from "react";
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
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    subtypes: ["Casa Térrea", "Sobrado", "Chalé", "Casa em Condomínio"],
  },
  {
    type: "Apartamento",
    image:
      "https://womaqnguctkhxqdiacwp.supabase.co/storage/v1/object/public/imagens//Apartamento.jpg",
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
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    registrationNumber: "",
    area: "",
    value: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedType || !selectedSubtype) return;

    setLoading(true);
    try {
      // Create property
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert([
          {
            title: formData.title,
            type: selectedType,
            subtype: selectedSubtype,
            registration_number: formData.registrationNumber,
            area: parseFloat(formData.area) || 0,
            value: parseFloat(formData.value) || 0,
            street: formData.street,
            number: formData.number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Create inspection
      const { error: inspectionError } = await supabase
        .from("inspections")
        .insert([
          {
            property_id: property.id,
            inspector_id: user.id,
            inspection_date: new Date().toISOString(),
            status: "in_progress",
            observations: "",
          },
        ]);

      if (inspectionError) throw inspectionError;

      toast({
        title: "Imóvel registrado",
        description: "O imóvel foi registrado com sucesso.",
      });

      navigate("/property-environments");
    } catch (error) {
      console.error("Error creating property:", error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar imóvel",
        description: "Ocorreu um erro ao registrar o imóvel. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">
            Registrar Novo Imóvel
          </h1>

          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Tipo do Imóvel
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {propertyTypes.map((propertyType) => (
                <Card
                  key={propertyType.type}
                  className={`cursor-pointer transition-all ${selectedType === propertyType.type ? "ring-2 ring-red-500" : "hover:border-red-500"}`}
                  onClick={() => setSelectedType(propertyType.type)}
                >
                  <div className="relative h-32">
                    <img
                      src={propertyType.image}
                      alt={propertyType.type}
                      className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-t-lg" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <span className="text-white text-lg font-medium">
                        {propertyType.type}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 left-2 bg-red-500/80 hover:bg-red-600/90 text-white font-medium"
                      >
                        Clique aqui
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {selectedType && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Subtipo do Imóvel
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {propertyTypes
                  .find((p) => p.type === selectedType)
                  ?.subtypes.map((subtype) => (
                    <Card
                      key={subtype}
                      className={`cursor-pointer p-4 transition-all ${selectedSubtype === subtype ? "ring-2 ring-red-500" : "hover:border-red-500"}`}
                      onClick={() => setSelectedSubtype(subtype)}
                    >
                      <span
                        className={`text-sm font-medium ${selectedSubtype === subtype ? "text-red-600" : "text-gray-900"}`}
                      >
                        {subtype}
                      </span>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {selectedType && selectedSubtype && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Informações Básicas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título do Imóvel</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Ex: Casa em Condomínio Fechado"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="registrationNumber">
                      Número de Registro
                    </Label>
                    <Input
                      id="registrationNumber"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      placeholder="Ex: 123456"
                    />
                  </div>
                  <div>
                    <Label htmlFor="area">Área (m²)</Label>
                    <Input
                      id="area"
                      name="area"
                      type="number"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="Ex: 100"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="value">Valor (R$)</Label>
                    <Input
                      id="value"
                      name="value"
                      type="number"
                      value={formData.value}
                      onChange={handleInputChange}
                      placeholder="Ex: 500000"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Logradouro</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Ex: Rua das Flores"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      placeholder="Ex: 123"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      name="complement"
                      value={formData.complement}
                      onChange={handleInputChange}
                      placeholder="Ex: Apto 101"
                    />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleInputChange}
                      placeholder="Ex: Centro"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Ex: São Paulo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Ex: SP"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="Ex: 12345-678"
                      required
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Continuar"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyRegistration;
