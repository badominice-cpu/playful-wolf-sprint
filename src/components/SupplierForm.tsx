import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Supplier } from '@/types';
import { showError, showSuccess } from '@/utils/toast';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  contact_info: z.string().optional(),
});

interface SupplierFormProps {
  supplier?: Supplier | null;
  onSave: () => void;
}

export const SupplierForm = ({ supplier, onSave }: SupplierFormProps) => {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: supplier?.name || '',
      contact_info: supplier?.contact_info || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    let error;
    if (supplier) {
      // Edit
      const { error: updateError } = await supabase
        .from('suppliers')
        .update(values)
        .eq('id', supplier.id);
      error = updateError;
    } else {
      // Create
      const { error: insertError } = await supabase.from('suppliers').insert(values);
      error = insertError;
    }

    if (error) {
      showError(error.message);
    } else {
      showSuccess(`Fornecedor ${supplier ? 'atualizado' : 'criado'} com sucesso!`);
      onSave();
    }
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Embalagens & Cia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact_info"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Informações de Contato</FormLabel>
              <FormControl>
                <Textarea placeholder="Telefone, e-mail, nome do contato..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </Form>
  );
};