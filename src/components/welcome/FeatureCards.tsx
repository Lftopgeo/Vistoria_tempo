import React from "react";
import { ClipboardList, Building2, Search, Clock } from "lucide-react";
import FeatureCard from "./FeatureCard";

import { LucideIcon } from "lucide-react";

interface FeatureCardsProps {
  features?: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
  }>;
}

const FeatureCards = ({ features }: FeatureCardsProps) => {
  const defaultFeatures = [
    {
      icon: ClipboardList,
      title: "Vistorias Detalhadas",
      description:
        "Realize inspeções completas com checklists personalizados e fotos em alta resolução.",
    },
    {
      icon: Building2,
      title: "Gestão Imobiliária",
      description:
        "Organize todas as suas propriedades e vistorias em um só lugar de forma eficiente.",
    },
    {
      icon: Search,
      title: "Busca Inteligente",
      description:
        "Encontre rapidamente qualquer vistoria ou propriedade com nossa busca avançada.",
    },
    {
      icon: Clock,
      title: "Histórico Completo",
      description:
        "Mantenha um registro detalhado de todas as vistorias realizadas ao longo do tempo.",
    },
  ];

  const displayFeatures = features || defaultFeatures;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
        {displayFeatures.map((feature, index) => (
          <div key={index} className="flex justify-center">
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureCards;
