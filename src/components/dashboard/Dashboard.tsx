import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "./DashboardHeader";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { createTestInspection } from "@/lib/testData";
import { ClipboardList, Clock, Plus, Pencil, Trash2 } from "lucide-react";
import ProjectCard from "./ProjectCard";
import BottomNav from "./BottomNav";
import { Calendar } from "./../ui/calendar";
import { Database } from "@/types/supabase";
import { useToast } from "@/components/ui/use-toast";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type Inspection = Database["public"]["Tables"]["inspections"]["Row"];

interface DashboardProps {
  onLogout?: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const fetchData = async () => {
    if (!user) return;

    try {
      const [propertiesResponse, inspectionsResponse] = await Promise.all([
        supabase
          .from("properties")
          .select("*")
          .eq("created_by", user?.id)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("inspections")
          .select("*")
          .eq("inspector_id", user?.id)
          .order("created_at", { ascending: false }),
      ]);

      if (propertiesResponse.error) throw propertiesResponse.error;
      if (inspectionsResponse.error) throw inspectionsResponse.error;

      setProperties(propertiesResponse.data);
      setInspections(inspectionsResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleEdit = (inspectionId: string) => {
    navigate(`/inspection/${inspectionId}`);
  };

  const handleDelete = async (inspectionId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta vistoria?")) return;

    try {
      const { error } = await supabase
        .from("inspections")
        .delete()
        .eq("id", inspectionId);

      if (error) throw error;

      toast({
        title: "Vistoria excluída",
        description: "A vistoria foi excluída com sucesso.",
      });

      fetchData(); // Recarrega os dados
    } catch (error) {
      console.error("Error deleting inspection:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a vistoria.",
      });
    }
  };

  const activeInspections = inspections.filter(
    (i) => i.status === "in_progress",
  ).length;
  const pendingInspections = inspections.filter(
    (i) => i.status === "pending",
  ).length;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <DashboardHeader onLogout={onLogout} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Olá, {user?.email}
            </h1>
            <p className="text-gray-600">Bem-vindo ao seu painel de controle</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <ClipboardList className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900">
                {activeInspections}
              </h3>
              <p className="text-gray-600">Vistorias Ativas</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-blue-600 hover:text-blue-700"
                onClick={() => handleEdit("active")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
                onClick={() => handleDelete("active")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900">
                {pendingInspections}
              </h3>
              <p className="text-gray-600">Pendentes</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-blue-600 hover:text-blue-700"
                onClick={() => handleEdit("pending")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
                onClick={() => handleDelete("pending")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Calendário de Vistorias
            </h2>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border w-full"
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Próximas Vistorias</h2>
            <div className="space-y-4">
              {inspections.slice(0, 3).map((inspection) => (
                <div
                  key={inspection.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      Vistoria #{inspection.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(
                        inspection.inspection_date || "",
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${inspection.status === "in_progress" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {inspection.status === "in_progress"
                        ? "Em Andamento"
                        : "Pendente"}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700"
                        onClick={() => handleEdit(inspection.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(inspection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto flex justify-center">
          <div className="flex gap-4">
            <Button
              onClick={() => navigate("/new-inspection")}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-full shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Vistoria
            </Button>
            <Button
              onClick={async () => {
                try {
                  if (!user) return;
                  const inspectionId = await createTestInspection(user.id);
                  toast({
                    title: "Vistoria de teste criada",
                    description: "Redirecionando para o relatório...",
                  });
                  navigate(`/inspection-report/${inspectionId}`);
                } catch (error) {
                  console.error("Error creating test inspection:", error);
                  toast({
                    variant: "destructive",
                    title: "Erro ao criar vistoria de teste",
                    description: "Tente novamente.",
                  });
                }
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-6 rounded-full shadow-lg"
            >
              Criar Vistoria de Teste
            </Button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Dashboard;
