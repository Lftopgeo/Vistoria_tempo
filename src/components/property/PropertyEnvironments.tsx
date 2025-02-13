import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";

type Room = Database["public"]["Tables"]["rooms"]["Row"];

const defaultRooms = [
  {
    name: "quarto",
    description: "Quarto e suítes",
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=500",
    status: "Pendente",
  },
  {
    name: "sala",
    description: "Sala de estar e jantar",
    image:
      "https://images.unsplash.com/photo-1585128792020-803d29415281?q=80&w=500",
    status: "Pendente",
  },
  {
    name: "cozinha",
    description: "Cozinha e área de serviço",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=500",
    status: "Pendente",
  },
  {
    name: "banheiro",
    description: "Banheiros e lavabos",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=500",
    status: "Pendente",
  },
];

const roomImages = {
  quarto:
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=500",
  sala: "https://images.unsplash.com/photo-1585128792020-803d29415281?q=80&w=500",
  cozinha:
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=500",
  banheiro:
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=500",
  default:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053",
};

const PropertyEnvironments = () => {
  const [customRooms, setCustomRooms] = useState<typeof defaultRooms>([]);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentInspection, setCurrentInspection] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchInspectionAndRooms = async () => {
      if (!user) return;

      try {
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

        // Get rooms for this inspection
        const { data: rooms, error: roomsError } = await supabase
          .from("rooms")
          .select("*")
          .eq("inspection_id", inspection.id);

        if (roomsError) throw roomsError;

        setRooms(rooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar ambientes",
          description: "Ocorreu um erro ao carregar os ambientes.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInspectionAndRooms();
  }, [user]);

  const handleInspection = async (roomName: string) => {
    if (!currentInspection || !user) return;

    try {
      // Check if room already exists
      const existingRoom = rooms.find(
        (r) => r.name.toLowerCase() === roomName.toLowerCase(),
      );

      if (existingRoom) {
        navigate(
          `/room-inspection/${roomName.toLowerCase().replace(/ /g, "-")}`,
        );
        return;
      }

      // Create new room
      const defaultRoom = defaultRooms.find(
        (r) => r.name.toLowerCase() === roomName.toLowerCase(),
      );

      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .insert([
          {
            inspection_id: currentInspection,
            name: roomName,
            description: defaultRoom?.description || "",
            image_url: defaultRoom?.image,
          },
        ])
        .select()
        .single();

      if (roomError) throw roomError;

      setRooms([...rooms, room]);
      navigate(`/room-inspection/${roomName.toLowerCase().replace(/ /g, "-")}`);
    } catch (error) {
      console.error("Error creating room:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar ambiente",
        description: "Ocorreu um erro ao criar o ambiente. Tente novamente.",
      });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-3xl w-4/5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Ambientes do Imóvel
        </button>

        <div className="w-full">
          <h2 className="text-3xl md:text-4xl font-medium text-black mb-8">
            Ambientes da Casa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Add Room Card */}
            <Card
              className="flex flex-col items-center justify-center p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setShowAddRoom(true)}
            >
              <Plus className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                Adicionar Cômodo
              </h3>
              <p className="text-gray-500 text-center">
                Clique para adicionar um novo ambiente
              </p>
            </Card>

            {/* Add Room Dialog */}
            {showAddRoom && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Adicionar Novo Cômodo
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome do Cômodo</Label>
                      <Input
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="Ex: Escritório"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input
                        value={newRoomDescription}
                        onChange={(e) => setNewRoomDescription(e.target.value)}
                        placeholder="Breve descrição do ambiente"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddRoom(false);
                          setNewRoomName("");
                          setNewRoomDescription("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => {
                          if (newRoomName.trim()) {
                            setCustomRooms([
                              ...customRooms,
                              {
                                name: newRoomName.toLowerCase(),
                                description:
                                  newRoomDescription ||
                                  `Vistoria do ${newRoomName}`,
                                image: roomImages.default,
                                status: "Pendente",
                              },
                            ]);
                            setShowAddRoom(false);
                            setNewRoomName("");
                            setNewRoomDescription("");
                          }
                        }}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            {[...defaultRooms, ...customRooms].map((room, index) => {
              const existingRoom = rooms.find(
                (r) => r.name.toLowerCase() === room.name.toLowerCase(),
              );
              const status = existingRoom ? "Concluído" : "Pendente";
              const statusColor = existingRoom
                ? "text-green-600"
                : "text-yellow-600";

              return (
                <div
                  key={index}
                  className="flex flex-col items-center rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="flex flex-col items-center gap-2 p-4 w-full bg-white">
                    <h3 className="text-gray-900 text-2xl font-medium leading-[32px] text-center capitalize">
                      {room.name}
                    </h3>
                    <p className="text-gray-600 text-lg font-normal leading-[24px] text-center">
                      {room.description}
                    </p>
                    <p className={`text-sm mb-2 ${statusColor}`}>
                      Status: {status}
                    </p>
                    <Button
                      onClick={() => handleInspection(room.name)}
                      className="bg-red-600 hover:bg-red-700 text-white w-32"
                    >
                      {existingRoom ? "Revisar" : "Vistoriar"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => navigate("/inspection-summary")}
            className="bg-red-600 hover:bg-red-700 text-white w-64"
          >
            Finalizar Vistoria
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyEnvironments;
