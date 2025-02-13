import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowLeft, FileText, Download, Home } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/types/supabase";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type Inspection = Database["public"]["Tables"]["inspections"]["Row"];
type Room = Database["public"]["Tables"]["rooms"]["Row"];
type RoomItem = Database["public"]["Tables"]["room_items"]["Row"];
type ItemImage = Database["public"]["Tables"]["item_images"]["Row"];

interface RoomSummary {
  name: string;
  totalItems: number;
  conditions: {
    bom: number;
    ruim: number;
    pessimo: number;
  };
  image: string;
  items?: RoomItem[];
  images?: ItemImage[];
}

const InspectionReport = () => {
  const navigate = useNavigate();
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);

  useEffect(() => {
    const fetchInspectionData = async () => {
      if (!user || !inspectionId) return;

      try {
        // Get inspection with property details
        const { data: inspection, error: inspectionError } = await supabase
          .from("inspections")
          .select(
            `
            *,
            properties:property_id(*)
          `,
          )
          .eq("id", inspectionId)
          .single();

        if (inspectionError) throw inspectionError;

        setInspection(inspection);
        setProperty(inspection.properties as Property);

        // Get rooms with their items and images
        const { data: rooms, error: roomsError } = await supabase
          .from("rooms")
          .select(
            `
            *,
            room_items (*, item_images(*))
          `,
          )
          .eq("inspection_id", inspectionId);

        if (roomsError) throw roomsError;

        // Process room data
        const summaries =
          rooms?.map((room: any) => {
            const conditions = room.room_items.reduce(
              (acc: any, item: any) => {
                acc[item.condition] = (acc[item.condition] || 0) + 1;
                return acc;
              },
              { bom: 0, ruim: 0, pessimo: 0 },
            );

            return {
              name: room.name,
              totalItems: room.room_items.length,
              conditions,
              image: room.image_url,
              items: room.room_items,
            };
          }) || [];

        setRooms(summaries);
      } catch (error) {
        console.error("Error fetching inspection data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados da vistoria.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInspectionData();
  }, [user, inspectionId]);

  // ... rest of the component code ...

  return <div>InspectionReport Component</div>;
};

export default InspectionReport;
