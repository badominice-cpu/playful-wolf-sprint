import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Login realizado com sucesso!');
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Cadastro realizado! Verifique seu e-mail para confirmação.');
      setIsSignUp(false);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      showError(`Erro no login com Google: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Package className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? 'Criar Conta' : 'Jadson'}
          </CardTitle>
          <CardDescription>
            {isSignUp ? 'Preencha os campos para se cadastrar.' : 'Controle de Estoque de Embalagens'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? (isSignUp ? 'Cadastrando...' : 'Entrando...') : (isSignUp ? 'Cadastrar' : 'Entrar')}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Ou continue com
              </span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
            <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.37 1.62-3.82 1.62-4.74 0-8.58-3.84-8.58-8.58s3.84-8.58 8.58-8.58c2.69 0 4.52.99 5.6 2.02l2.58-2.58C20.26 2.49 17.13 1 12.48 1 5.88 1 1 5.88 1 12.48s4.88 11.48 11.48 11.48c3.47 0 6.23-1.17 8.2-3.25 2.02-2.02 2.64-5.02 2.64-7.92 0-.6-.05-1.18-.15-1.72H12.48z"></path></svg>
            Google
          </Button>

          <div className="mt-4 text-center text-sm">
            {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="pl-1">
              {isSignUp ? 'Entrar' : 'Cadastre-se'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;