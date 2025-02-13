import React from "react";
import { Bell, User } from "lucide-react";
import { Button } from "../ui/button";

interface DashboardHeaderProps {
  onLogout?: () => void;
}

const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M20 90 L20 50 L50 20 L80 50 L80 90 Z"
                className="fill-none stroke-[#FFA726]"
                strokeWidth="4"
              />
              <path
                d="M40 30 L60 30 L60 45 L40 45 Z"
                className="fill-[#FFA726]"
              />
              <path
                d="M45 45 L55 45 L65 70 L35 70 Z"
                className="fill-[#FFA726]"
                opacity="0.5"
              />
              <circle cx="50" cy="65" r="5" className="fill-[#4CAF50]" />
              <rect
                x="40"
                y="55"
                width="20"
                height="25"
                className="fill-[#FFA726]"
              />
              <line
                x1="40"
                y1="65"
                x2="60"
                y2="65"
                stroke="#1A1A1A"
                strokeWidth="2"
              />
              <line
                x1="40"
                y1="70"
                x2="60"
                y2="70"
                stroke="#1A1A1A"
                strokeWidth="2"
              />
            </svg>
          </div>
          <span className="text-xl font-semibold text-gray-900">
            <span>GEO</span>
            <span className="text-[#FFA726]">APP</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <User className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
