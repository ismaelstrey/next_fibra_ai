// src/app/registro/page.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LockIcon, MailIcon, UserIcon } from 'lucide-react';

/**
 * Esquema de validação do formulário de registro
 */
const registroSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine(data => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

/**
 * Tipo dos dados do formulário de registro
 */
type RegistroFormData = z.infer<typeof registroSchema>;

/**
 * Página de registro
 */
export default function RegistroPage() {
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  // Configuração do formulário com react-hook-form e zod
  const form = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
    },
  });

  /**
   * Função para lidar com o envio do formulário
   * @param data - Dados do formulário
   */
  const handleSubmit = async (data: RegistroFormData) => {

    console.log(data)
    try {
      setCarregando(true);

     const resultado = await axios.post('/api/registro', data)
      
      // const response = await fetch('/api/registro', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(data),
      // });



     console.log(resultado)

      toast.success('Registro realizado com sucesso!');
      // router.push('/login');
    } catch (error) {
      console.error('Erro ao registrar:', error);
      toast.error('Ocorreu um erro ao processar o registro');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">FibraDoc</CardTitle>
            <CardDescription className="text-center">
              Crie sua conta para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            placeholder="Seu nome completo" 
                            {...field} 
                            className="pl-10"
                            disabled={carregando}
                          />
                        </FormControl>
                        <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            placeholder="seu.email@exemplo.com" 
                            {...field} 
                            className="pl-10"
                            disabled={carregando}
                          />
                        </FormControl>
                        <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="******" 
                            {...field} 
                            className="pl-10"
                            disabled={carregando}
                          />
                        </FormControl>
                        <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmarSenha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="******" 
                            {...field} 
                            className="pl-10"
                            disabled={carregando}
                          />
                        </FormControl>
                        <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={carregando}
                >
                  {carregando ? 'Registrando...' : 'Registrar'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center">
              Já possui uma conta?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Faça login
              </Link>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              Sistema de Documentação de Fibra Óptica
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}