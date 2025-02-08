import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
}

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("admin@geoapp.com");
  const [password, setPassword] = React.useState("admin123");
  const defaultCredentials = {
    email: "admin@geoapp.com",
    password: "admin123",
  };
  const [loading, setLoading] = React.useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) {
        toast({
          variant: "destructive",
          title: "Erro de validação",
          description: "Email e senha são obrigatórios",
        });
        return;
      }
      setLoading(true);

      try {
        console.log(
          "Attempting login with:",
          email === defaultCredentials.email
            ? "default credentials"
            : "custom credentials",
        );
        await signIn(email, password);

        if (onSubmit) {
          onSubmit(email, password);
        }

        toast({
          title: "Login realizado com sucesso",
          description: "Redirecionando para o dashboard...",
        });

        navigate("/dashboard");
      } catch (error: any) {
        console.error("Erro no login:", error);
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description:
            error.message === "Invalid login credentials"
              ? "Email ou senha inválidos"
              : error.message ||
                "Erro ao fazer login. Por favor, tente novamente.",
        });
      } finally {
        setLoading(false);
      }
    },
    [email, password, signIn, navigate, onSubmit, toast],
  );

  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader>
        <h2 className="text-2xl font-semibold text-center text-gray-900">
          Login
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
