import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (user) {
        setLocation("/ide");
      }
    }
  }, [user, loading, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-foreground">OpenGame IDE</h1>
        <p className="text-xl text-muted-foreground mb-8">Создавайте браузерные игры с помощью AI</p>
        {!user && !loading && (
          <a href="/api/oauth/login" className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Начать
          </a>
        )}
        {loading && <p className="text-muted-foreground">Загрузка...</p>}
      </div>
    </div>
  );
}
