import React from "react";

interface WelcomeHeaderProps {
  logoText?: string;
}

const WelcomeHeader = ({ logoText = "GeoApp" }: WelcomeHeaderProps) => {
  return (
    <header className="relative w-full h-[280px] bg-[#1A1A1A] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://img.freepik.com/free-photo/3d-electric-car-building_23-2148972401.jpg?t=st=1737382138~exp=1737385738~hmac=540d4453d8ecfed0c3229ed6fc118d5f4c5177879927527f179d40fd9df9af77&w=1060"
          alt="Modern building"
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      {/* Logo Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
        <div className="w-24 h-24 mb-4 rounded-xl p-2 bg-[#272525] rounded-l-3xl">
          <svg viewBox="0 0 100 100" className="w-full h-full flex shadow-xl">
            {/* House shape */}
            <path
              d="M20 90 L20 50 L50 20 L80 50 L80 90 Z"
              className="fill-[#FFA726]"
            />
            {/* Door */}
            <path d="M45 90 L45 60 L55 60 L55 90" className="fill-[#1A1A1A]" />
            {/* Sun/Circle */}
            <circle cx="50" cy="30" r="15" className="fill-[#FFA726]" />
            {/* Base/Ground */}
            <path
              d="M10 90 C30 85, 70 85, 90 90"
              className="fill-[#FFA726]"
              strokeWidth="2"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-2">
          <span>{logoText.slice(0, 3)}</span>
          <span className="text-[#FFA726]">{logoText.slice(3)}</span>
        </h1>
        <p className="text-lg text-gray-300">
          Sua plataforma de vistorias imobiliárias
        </p>
      </div>
    </header>
  );
};

export default WelcomeHeader;
