import React from "react";
import WelcomeHeader from "./welcome/WelcomeHeader";
import FeatureCards from "./welcome/FeatureCards";
import CTASection from "./welcome/CTASection";

interface HomeProps {
  onGetStarted?: () => void;
}

const Home = ({ onGetStarted }: HomeProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomeHeader />
      <main className="container mx-auto px-4 py-8 pb-32">
        <FeatureCards />
      </main>
      <CTASection onGetStarted={onGetStarted} />
    </div>
  );
};

export default Home;
