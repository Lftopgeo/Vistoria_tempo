import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface InspectionFormProps {
  onSave?: (data: any) => void;
}

const InspectionForm = ({ onSave }: InspectionFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    inspectionDate: new Date().toISOString().split("T")[0],
    inspectorName: "",
    propertyType: "Apartamento",
    observations: "Vistoria inicial para avaliação do imóvel",
  });

  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        inspectorName: user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Create a temporary property for the inspection
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert([
          {
            title: `Vistoria - ${formData.propertyType}`,
            type: formData.propertyType,
            subtype: "Não especificado",
            area: 0,
            value: 0,
            registration_number: "Pendente",
            street: "Pendente",
            number: "Pendente",
            neighborhood: "Pendente",
            city: "Pendente",
            state: "Pendente",
            zip_code: "Pendente",
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Create the inspection
      const { error: inspectionError } = await supabase
        .from("inspections")
        .insert([
          {
            property_id: property.id,
            inspector_id: user.id,
            inspection_date: formData.inspectionDate,
            status: "in_progress",
            observations: formData.observations,
          },
        ]);

      if (inspectionError) throw inspectionError;

      if (onSave) {
        onSave(formData);
      }
    } catch (error) {
      console.error("Error creating inspection:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar vistoria",
        description: "Ocorreu um erro ao criar a vistoria. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Nova Vistoria
        </button>

        <Card className="bg-white">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">
              Nova Vistoria
            </h2>
            <p className="text-sm text-gray-600">
              Preencha os dados iniciais da vistoria
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="inspectionDate">Data da Vistoria</Label>
                <Input
                  id="inspectionDate"
                  name="inspectionDate"
                  type="date"
                  value={formData.inspectionDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspectorName">Nome do Vistoriador</Label>
                <Input
                  id="inspectorName"
                  name="inspectorName"
                  placeholder="Digite o nome do responsável pela vistoria"
                  value={formData.inspectorName}
                  onChange={handleChange}
                  required
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Tipo do Imóvel</Label>
                <Input
                  id="propertyType"
                  name="propertyType"
                  placeholder="Ex: Apartamento, Casa, Sala Comercial"
                  value={formData.propertyType}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações Iniciais</Label>
                <Textarea
                  id="observations"
                  name="observations"
                  placeholder="Adicione observações gerais sobre a vistoria"
                  value={formData.observations}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="flex gap-4 justify-end pt-4">
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
                  {loading ? "Criando..." : "Continuar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InspectionForm;
