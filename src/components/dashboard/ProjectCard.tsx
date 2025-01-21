import React from "react";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

interface ProjectCardProps {
  title: string;
  subtitle: string;
  progress: number;
  status: "Em Dia" | "Pendente";
  imageUrl?: string;
}

const ProjectCard = ({
  title = "Residencial Vista Verde",
  subtitle = "Torre A - Fundação",
  progress = 75,
  status = "Em Dia",
  imageUrl = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070",
}: ProjectCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs ${status === "Em Dia" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
          >
            {status}
          </span>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Progresso</p>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-600 text-right">{progress}%</p>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
