import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, Category, Supplier } from '@/types';
import { showError, showSuccess } from '@/utils/toast';

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  sku: z.string().min(1, { message: 'O SKU é obrigatório.' }),
  category_id: z.string().uuid({ message: 'Selecione uma categoria válida.' }),
  supplier_id: z.string().uuid({ message: 'Selecione um fornecedor válido.' }),
  unit: z.string().min(1, { message: 'A unidade é obrigatória.' }),
  min_stock: z.coerce.number().int().min(0, { message: 'O estoque mínimo não pode ser negativo.' }),
  current_stock: z.coerce.number().int().min(0, { message: 'O estoque atual não pode ser negativo.' }),
  notes: z.string().optional(),
});

// Lista de unidades corrigida para corresponder à regra do banco de dados.
const unitOptions = ['cx', 'pct', 'un', 'kg', 'l', 'm'];

interface ProductFormProps {
  product?: Product | null;
  onSave: () => void;
}

export const ProductForm = ({ product, onSave }: ProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('*');
      if (categoriesError) showError('Erro ao buscar categorias.');
      else setCategories(categoriesData);

      const { data: suppliersData, error: suppliersError } = await supabase.from('suppliers').select('*');
      if (suppliersError) showError('Erro ao buscar fornecedores.');
      else setSuppliers(suppliersData);
    };
    fetchData();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      category_id: product?.category_id || undefined,
      supplier_id: product?.supplier_id || undefined,
      unit: product?.unit || undefined,
      min_stock: product?.min_stock || 0,
      current_stock: product?.current_stock || 0,
      notes: product?.notes || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    let error;
    if (product) {
      const { error: updateError } = await supabase.from('products').update(values).eq('id', product.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('products').insert(values);
      error = insertError;
    }

    if (error) {
      showError(error.message);
    } else {
      showSuccess(`Produto ${product ? 'atualizado' : 'criado'} com sucesso!`);
      onSave();
    }
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl><Input placeholder="Ex: Caixa de Papelão M" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="sku" render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl><Input placeholder="Ex: CX-PAP-M-001" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="category_id" render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="supplier_id" render={({ field }) => (
            <FormItem>
              <FormLabel>Fornecedor</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecione um fornecedor" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers.map(sup => <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="current_stock" render={({ field }) => (
                <FormItem>
                <FormLabel>Estoque Atual</FormLabel>
                <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="min_stock" render={({ field }) => (
                <FormItem>
                <FormLabel>Estoque Mínimo</FormLabel>
                <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unitOptions.map(unit => <SelectItem key={unit} value={unit}>{unit.toUpperCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
            )} />
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl><Textarea placeholder="Detalhes adicionais sobre o produto..." className="resize-none" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </Form>
  );
};