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
  const typeRef = React.useRef<HTMLDivElement>(null);
  const subtypeRef = React.useRef<HTMLDivElement>(null);
  const formRef = React.useRef<HTMLDivElement>(null);
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
    inspectorName: "",
    inspectorCreci: "",
    ownerName: "",
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
    if (!user || !selectedType || !selectedSubtype || !formData.title) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha o tipo, subtipo e título do imóvel.",
      });
      return;
    }

    setLoading(true);
    try {
      // Create property
      const propertyData = {
        title: formData.title,
        type: selectedType,
        subtype: selectedSubtype,
        registration_number: formData.registrationNumber || null,
        area: formData.area ? parseFloat(formData.area) : null,
        value: formData.value ? parseFloat(formData.value) : null,
        inspector_name: formData.inspectorName || null,
        inspector_creci: formData.inspectorCreci || null,
        owner_name: formData.ownerName || null,
        street: formData.street || null,
        number: formData.number || null,
        complement: formData.complement || null,
        neighborhood: formData.neighborhood || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zipCode || null,
        created_by: user.id,
      };

      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert([propertyData])
        .select()
        .single();

      if (propertyError) {
        console.error("Property Error:", propertyError);
        throw new Error("Erro ao criar propriedade");
      }

      if (!property?.id) {
        throw new Error("ID da propriedade não encontrado");
      }

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

      if (inspectionError) {
        console.error("Inspection Error:", inspectionError);
        throw new Error("Erro ao criar inspeção");
      }

      toast({
        title: "Imóvel registrado",
        description: "O imóvel foi registrado com sucesso.",
      });

      navigate("/property-environments");
    } catch (error: any) {
      console.error("Error creating property:", error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar imóvel",
        description:
          error.message ||
          "Ocorreu um erro ao registrar o imóvel. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setTimeout(() => scrollToRef(subtypeRef), 100);
  };

  const handleSubtypeSelect = (subtype: string) => {
    setSelectedSubtype(subtype);
    setTimeout(() => scrollToRef(formRef), 100);
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

          <div className="mb-8" ref={typeRef}>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Tipo do Imóvel
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {propertyTypes.map((propertyType) => (
                <Card
                  key={propertyType.type}
                  className={`cursor-pointer transition-all ${selectedType === propertyType.type ? "ring-2 ring-red-500" : "hover:border-red-500"}`}
                  onClick={() => handleTypeSelect(propertyType.type)}
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
            <div className="mb-8" ref={subtypeRef}>
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
                      onClick={() => handleSubtypeSelect(subtype)}
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
            <form onSubmit={handleSubmit} className="space-y-6" ref={formRef}>
              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Informações Básicas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inspectorName">Nome do Vistoriador</Label>
                    <Input
                      id="inspectorName"
                      name="inspectorName"
                      value={formData.inspectorName}
                      onChange={handleInputChange}
                      placeholder="Nome completo do vistoriador"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inspectorCreci">CRECI</Label>
                    <Input
                      id="inspectorCreci"
                      name="inspectorCreci"
                      value={formData.inspectorCreci}
                      onChange={handleInputChange}
                      placeholder="Número do CRECI"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="ownerName">
                      Nome do Proprietário/Inquilino
                    </Label>
                    <Input
                      id="ownerName"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      placeholder="Nome completo do proprietário ou inquilino"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="title"
                      className="flex items-center justify-between"
                    >
                      <span>Título do Imóvel</span>
                      <span className="text-sm text-muted-foreground">
                        * Nome que será exibido na vistoria
                      </span>
                    </Label>
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
