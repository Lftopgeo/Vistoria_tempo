import { useLocation } from "react-router-dom";
import { Stepper } from "../ui/stepper";

const steps = [
  {
    path: "/new-inspection",
    title: "1. Dados do Imóvel",
  },
  {
    path: "/property-environments",
    title: "2. Ambientes",
  },
  {
    path: "/room-inspection",
    title: "3. Vistoria",
  },
  {
    path: "/inspection-summary",
    title: "4. Resumo",
  },
];

export function NavStepper() {
  const location = useLocation();
  const currentPathIndex = steps.findIndex((step) =>
    location.pathname.startsWith(step.path),
  );

  const mappedSteps = steps.map((step, index) => ({
    ...step,
    status:
      index < currentPathIndex
        ? "completed"
        : index === currentPathIndex
          ? "current"
          : "upcoming",
  }));

  return (
    <div className="bg-white border-b border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <Stepper steps={mappedSteps} currentStep={currentPathIndex} />
      </div>
    </div>
  );
}
