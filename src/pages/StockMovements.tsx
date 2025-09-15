import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Product, StockMovement } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { showError } from '@/utils/toast';
import { ArrowLeft, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const StockMovements = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) return;
      setLoading(true);

      // Busca os detalhes do produto
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) {
        showError('Erro ao buscar detalhes do produto.');
        console.error(productError);
      } else {
        setProduct(productData);
      }

      // Busca o histórico de movimentações
      const { data: movementsData, error: movementsError } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (movementsError) {
        showError('Erro ao buscar histórico de movimentações.');
        console.error(movementsError);
      } else {
        setMovements(movementsData);
      }

      setLoading(false);
    };

    fetchData();
  }, [productId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="flex items-center mb-4">
        <Button variant="outline" size="icon" className="mr-4" asChild>
          <Link to="/products">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para Produtos</span>
          </Link>
        </Button>
        {loading ? (
          <Skeleton className="h-8 w-64" />
        ) : (
          <h1 className="text-lg font-semibold md:text-2xl">
            Histórico de: {product?.name || 'Produto não encontrado'}
          </h1>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
          <CardDescription>
            Veja todas as entradas e saídas de estoque para este produto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="hidden md:table-cell">Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : movements.length > 0 ? (
                movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="font-medium">{formatDate(movement.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={movement.type === 'entrada' ? 'default' : 'secondary'} className="gap-1">
                        {movement.type === 'entrada' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {movement.type === 'entrada' ? '+' : '-'} {movement.quantity}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{movement.notes || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhuma movimentação registrada para este produto.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default StockMovements;