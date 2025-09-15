import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona sempre para o dashboard, pois a rota já é protegida
    navigate('/dashboard');
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
            <p className="text-muted-foreground">Carregando...</p>
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-8 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  return null; // Evita renderizar qualquer coisa durante o redirecionamento
};

export default Index;