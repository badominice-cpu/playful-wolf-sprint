import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Skeleton } from '@/components/ui/skeleton';
import { ProductForm } from '@/components/ProductForm';
import { StockMovementForm } from '@/components/StockMovementForm';
import { showError, showSuccess } from '@/utils/toast';
import { Input } from '@/components/ui/input';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase
        .from('products')
        .select(`*, categories ( name ), suppliers ( name )`);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('name');

      if (error) {
        showError('Erro ao buscar produtos.');
        console.error(error);
      } else {
        setProducts(data as any);
      }
      setLoading(false);
    };

    // Debounce a busca para evitar chamadas excessivas à API
    const handler = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormDialogOpen(true);
  };

  const handleDeleteRequest = (product: Product) => {
    setSelectedProduct(product);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    const { error } = await supabase.from('products').delete().eq('id', selectedProduct.id);
    if (error) {
      showError('Erro ao excluir produto.');
    } else {
      showSuccess('Produto excluído com sucesso!');
      setSearchTerm(''); // Limpa a busca para recarregar a lista
    }
    setIsAlertOpen(false);
    setSelectedProduct(null);
  };

  const handleFormSave = () => {
    setIsFormDialogOpen(false);
    setSelectedProduct(null);
    setSearchTerm(''); // Limpa a busca para recarregar a lista
  }
  
  const handleMovementSave = () => {
    setIsMovementDialogOpen(false);
    setSelectedProduct(null);
    setSearchTerm(''); // Limpa a busca para recarregar a lista
  }

  return (
    <>
      <div className="flex items-center mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Produtos</h1>
        <div className="ml-auto flex items-center gap-2">
          <Dialog open={isFormDialogOpen} onOpenChange={(open) => {
            if (!open) setSelectedProduct(null);
            setIsFormDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-rap">
                  Adicionar Produto
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>{selectedProduct ? 'Editar Produto' : 'Adicionar Produto'}</DialogTitle>
                <DialogDescription>
                  {selectedProduct ? 'Altere os dados do produto.' : 'Preencha os dados do novo produto.'}
                </DialogDescription>
              </DialogHeader>
              <ProductForm product={selectedProduct} onSave={handleFormSave} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Estoque de Embalagens</CardTitle>
          <CardDescription>
            Gerencie suas embalagens e visualize o estoque atual.
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
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
                <TableHead><span className="sr-only">Ações</span></TableHead>
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
                          <DropdownMenuItem onClick={() => handleEdit(product)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedProduct(product);
                            setIsMovementDialogOpen(true);
                          }}>
                            Movimentar Estoque
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/products/${product.id}/movements`)}>
                            Ver Histórico
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRequest(product)}>Excluir</DropdownMenuItem>
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

      <Dialog open={isMovementDialogOpen} onOpenChange={(open) => {
        if (!open) setSelectedProduct(null);
        setIsMovementDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Movimentar Estoque: {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Registre uma entrada ou saída de estoque para este produto. O estoque atual é {selectedProduct?.current_stock}.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && <StockMovementForm product={selectedProduct} onSave={handleMovementSave} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o produto
              "{selectedProduct?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProduct(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Products;