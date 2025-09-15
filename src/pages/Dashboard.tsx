import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Package, Package2, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const [stats, setStats] = useState({ productCount: 0, supplierCount: 0, categoryCount: 0 });
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const [productsRes, suppliersRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true })
      ]);

      if (productsRes.error || suppliersRes.error || categoriesRes.error) {
        console.error('Error fetching dashboard data:', productsRes.error || suppliersRes.error || categoriesRes.error);
        setLoading(false);
        return;
      }

      const allProducts: Product[] = productsRes.data || [];
      const lowStock = allProducts.filter(p => p.current_stock <= p.min_stock);
      
      setStats({
        productCount: allProducts.length,
        supplierCount: suppliersRes.count ?? 0,
        categoryCount: categoriesRes.count ?? 0,
      });
      setLowStockProducts(lowStock);

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="flex items-center mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.productCount}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.supplierCount}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.categoryCount}</div>}
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : lowStockProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="hidden sm:table-cell">SKU</TableHead>
                    <TableHead className="text-right">Estoque Atual</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Estoque Mínimo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map(product => (
                    <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate('/products')}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{product.sku}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">{product.current_stock} {product.unit}</Badge>
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{product.min_stock} {product.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum produto com estoque baixo. Ótimo trabalho!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;