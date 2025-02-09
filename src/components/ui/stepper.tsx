import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface Step {
  title: string;
  status: "completed" | "current" | "upcoming";
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol role="list" className="flex items-center">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex-1 flex items-center">
            {index > 0 && (
              <div
                className={cn(
                  "absolute left-0 right-0 h-0.5 -translate-y-4",
                  step.status === "upcoming"
                    ? "bg-gray-200"
                    : step.status === "current"
                      ? "bg-red-200"
                      : "bg-green-200",
                )}
                style={{ width: "calc(100% - 2rem)", left: "1rem" }}
              />
            )}
            <div className="relative flex flex-col items-center group">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2",
                  step.status === "completed"
                    ? "bg-green-100 border-green-600"
                    : step.status === "current"
                      ? "bg-red-100 border-red-600"
                      : "bg-white border-gray-300",
                )}
              >
                {step.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <span
                    className={cn(
                      "text-sm font-medium",
                      step.status === "current"
                        ? "text-red-600"
                        : "text-gray-500",
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "absolute -bottom-6 text-xs font-medium whitespace-nowrap",
                  step.status === "completed"
                    ? "text-green-600"
                    : step.status === "current"
                      ? "text-red-600"
                      : "text-gray-500",
                )}
              >
                {step.title}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
