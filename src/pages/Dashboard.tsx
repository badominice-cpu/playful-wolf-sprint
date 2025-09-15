import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess('Você saiu com sucesso!');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">Sair</Button>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao Jadson!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Olá, {user?.email}!</p>
            <p className="mt-4 text-muted-foreground">
              Este é o seu painel de controle. Em breve, você verá aqui os relatórios e as principais funcionalidades do sistema de estoque.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;