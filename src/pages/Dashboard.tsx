import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo ao Jadson!</CardTitle>
              <CardDescription>Olá, {user?.email}!</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Este é o seu painel de controle. Use o menu lateral para navegar pelo sistema.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;