import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Session loaded:", session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email e senha são obrigatórios");
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        setSession(data.session);
        setUser(data.user);
        return data;
      }

      throw new Error("Usuário não encontrado");
    } catch (error: any) {
      console.error("Login error:", error);
      // Check if it's a network error
      if (!navigator.onLine) {
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description:
            "Verifique sua conexão com a internet e tente novamente.",
        });
      } else if (error.message?.includes("FetchError")) {
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description:
            "Não foi possível conectar ao servidor. Tente novamente em alguns instantes.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description:
            error.message === "Invalid login credentials"
              ? "Email ou senha inválidos"
              : "Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.",
        });
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);

      toast({
        title: "Logout realizado com sucesso",
        description: "Até logo!",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message,
      });
      throw error;
    }
  };

  const value = {
    session,
    user,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
