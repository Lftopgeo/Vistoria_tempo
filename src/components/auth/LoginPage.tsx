import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeHeader from "../welcome/WelcomeHeader";
import LoginForm from "./LoginForm";
import { useAuth } from "@/contexts/AuthContext";

interface LoginPageProps {
  onLogin?: (email: string, password: string) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = (email: string, password: string) => {
    if (onLogin) {
      onLogin(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomeHeader />
      <main className="container mx-auto px-4 py-8">
        <LoginForm onSubmit={handleLogin} />
      </main>
    </div>
  );
};

export default LoginPage;
