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
