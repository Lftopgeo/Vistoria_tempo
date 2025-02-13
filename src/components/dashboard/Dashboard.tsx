import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "./DashboardHeader";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { createTestInspection } from "@/lib/testData";
import {
  ClipboardList,
  Clock,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Calendar } from "../ui/calendar";
import type { Database } from "@/types/supabase";
import { useToast } from "../ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type Inspection = Database["public"]["Tables"]["inspections"]["Row"] & {
  properties: Property;
};

interface DashboardProps {
  onLogout?: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inspectionToDelete, setInspectionToDelete] = useState<string | null>(
    null,
  );

  const fetchInspections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("inspections")
        .select(
          `
          *,
          properties:property_id(*)
        `,
        )
        .eq("inspector_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setInspections(data || []);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar vistorias",
        description: "Não foi possível carregar suas vistorias.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [user]);

  const handleEdit = (inspection: Inspection) => {
    if (inspection.status === "completed") {
      navigate(`/inspection-report/${inspection.id}`);
    } else {
      navigate("/property-environments");
    }
  };

  const handleDelete = async (inspectionId: string) => {
    setInspectionToDelete(inspectionId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!inspectionToDelete) return;

    try {
      const inspection = inspections.find((i) => i.id === inspectionToDelete);
      if (!inspection) return;

      const { data: rooms } = await supabase
        .from("rooms")
        .select("id")
        .eq("inspection_id", inspectionToDelete);

      if (rooms) {
        for (const room of rooms) {
          const { data: roomItems } = await supabase
            .from("room_items")
            .select("id")
            .eq("room_id", room.id);

          if (roomItems) {
            for (const item of roomItems) {
              await supabase
                .from("item_images")
                .delete()
                .eq("item_id", item.id);
            }

            await supabase.from("room_items").delete().eq("room_id", room.id);
          }
        }

        await supabase
          .from("rooms")
          .delete()
          .eq("inspection_id", inspectionToDelete);
      }

      const { error } = await supabase
        .from("inspections")
        .delete()
        .eq("id", inspectionToDelete);

      if (error) throw error;

      toast({
        title: "Vistoria excluída",
        description: "A vistoria foi excluída com sucesso.",
      });

      setInspections(inspections.filter((i) => i.id !== inspectionToDelete));
    } catch (error) {
      console.error("Error deleting inspection:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a vistoria.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setInspectionToDelete(null);
    }
  };

  const activeInspections = inspections.filter(
    (i) => i.status === "in_progress",
  ).length;
  const pendingInspections = inspections.filter(
    (i) => i.status === "pending",
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando vistorias...</p>
        </div>
      </div>
    );
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
            <h2 className="text-xl font-semibold mb-4">Vistorias Recentes</h2>
            <div className="space-y-4">
              {inspections.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma vistoria encontrada</p>
                </div>
              ) : (
                inspections.slice(0, 5).map((inspection) => (
                  <div
                    key={inspection.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        {inspection.properties?.title || "Sem título"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(
                          inspection.inspection_date,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          inspection.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : inspection.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {inspection.status === "completed"
                          ? "Concluída"
                          : inspection.status === "in_progress"
                            ? "Em Andamento"
                            : "Pendente"}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700"
                          onClick={() => handleEdit(inspection)}
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
                ))
              )}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Vistoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta vistoria? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
