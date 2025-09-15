import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Product } from '@/types';
import { showError, showSuccess } from '@/utils/toast';
import { useState } from 'react';

const formSchema = z.object({
  type: z.enum(['entrada', 'saida'], { required_error: 'Você precisa selecionar o tipo de movimento.' }),
  quantity: z.coerce.number().int().positive({ message: 'A quantidade deve ser um número positivo.' }),
  notes: z.string().optional(),
});

interface StockMovementFormProps {
  product: Product;
  onSave: () => void;
}

export const StockMovementForm = ({ product, onSave }: StockMovementFormProps) => {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      notes: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    if (values.type === 'saida' && values.quantity > product.current_stock) {
      showError('A quantidade de saída não pode ser maior que o estoque atual.');
      setLoading(false);
      return;
    }

    const newStock = values.type === 'entrada'
      ? product.current_stock + values.quantity
      : product.current_stock - values.quantity;

    // 1. Insere o registro do movimento
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        product_id: product.id,
        type: values.type,
        quantity: values.quantity,
        notes: values.notes,
      });

    if (movementError) {
      showError(`Erro ao registrar movimento: ${movementError.message}`);
      setLoading(false);
      return;
    }

    // 2. Atualiza o estoque do produto
    const { error: productUpdateError } = await supabase
      .from('products')
      .update({ current_stock: newStock })
      .eq('id', product.id);

    if (productUpdateError) {
      showError(`ERRO CRÍTICO: O movimento foi registrado, mas o estoque do produto não foi atualizado. Ajuste manualmente. Erro: ${productUpdateError.message}`);
      setLoading(false);
      return;
    }

    showSuccess('Movimento de estoque registrado com sucesso!');
    onSave();
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Movimento</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="entrada" /></FormControl>
                    <FormLabel className="font-normal">Entrada</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="saida" /></FormControl>
                    <FormLabel className="font-normal">Saída</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade</FormLabel>
              <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (Opcional)</FormLabel>
              <FormControl><Textarea placeholder="Ex: Venda para cliente X, recebimento do fornecedor Y..." className="resize-none" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Movimento'}
        </Button>
      </form>
    </Form>
  );
};