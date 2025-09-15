import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories ( name ),
          suppliers ( name )
        `);

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data as any);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Produtos</h1>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Adicionar Produto
                </span>
            </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Estoque de Embalagens</CardTitle>
          <CardDescription>
            Gerencie suas embalagens e visualize o estoque atual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="hidden md:table-cell">Estoque</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell className="hidden md:table-cell">{product.current_stock} {product.unit}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={product.current_stock > product.min_stock ? 'outline' : 'destructive'}>
                        {product.current_stock > product.min_stock ? 'Em estoque' : 'Estoque baixo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{product.categories?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default Products;