import React from "react";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  onGetStarted?: () => void;
  buttonText?: string;
}

const CTASection = ({
  onGetStarted,
  buttonText = "Começar Agora",
}: CTASectionProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-6">
      <div className="max-w-7xl mx-auto flex justify-center">
        <Button
          onClick={onGetStarted}
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-6 text-lg rounded-full"
        >
          {buttonText}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default CTASection;
