import * as React from "react";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title?: string;
  description?: string;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  (
    {
      icon: Icon = Smartphone,
      title = "Feature Title",
      description = "This is a sample feature description that highlights the benefits of using our app.",
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "w-[280px] h-[220px] bg-white hover:shadow-lg transition-shadow duration-300",
          className,
        )}
        {...props}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#fffbe3]">
            <Icon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">{title}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{description}</p>
        </CardContent>
      </Card>
    );
  },
);

FeatureCard.displayName = "FeatureCard";

export default FeatureCard;
