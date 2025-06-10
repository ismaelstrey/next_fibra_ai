// src/app/api/usuarios/schema.ts

import { z } from "zod";

/**
 * Esquema base para validação de usuário
 */
const usuarioBaseSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  cargo: z.enum(["Engenheiro", "Técnico", "Gerente"], {
    errorMap: () => ({ message: "Cargo deve ser Engenheiro, Técnico ou Gerente" })
  }),
  imagem: z.string().optional().nullable(),
});

/**
 * Esquema para criação de usuário
 */
export const criarUsuarioSchema = usuarioBaseSchema.extend({
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string(),
}).refine(data => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

/**
 * Esquema para atualização de usuário
 */
export const atualizarUsuarioSchema = usuarioBaseSchema
  .partial()
  .extend({
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
    confirmarSenha: z.string().optional(),
    senhaAtual: z.string().optional(),
  })
  .refine(
    data => {
      // Se senha for fornecida, confirmarSenha também deve ser
      if (data.senha && !data.confirmarSenha) return false;
      // Se confirmarSenha for fornecida, senha também deve ser
      if (!data.senha && data.confirmarSenha) return false;
      // Se ambos forem fornecidos, devem ser iguais
      if (data.senha && data.confirmarSenha) {
        return data.senha === data.confirmarSenha;
      }
      return true;
    },
    {
      message: "As senhas não coincidem",
      path: ["confirmarSenha"],
    }
  )
  .refine(
    data => {
      // Se senha for fornecida, senhaAtual também deve ser
      if (data.senha && !data.senhaAtual) return false;
      return true;
    },
    {
      message: "Senha atual é necessária para alterar a senha",
      path: ["senhaAtual"],
    }
  );

/**
 * Esquema para atualização de senha
 */
export const alterarSenhaSchema = z.object({
  senhaAtual: z.string(),
  novaSenha: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string(),
}).refine(data => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});