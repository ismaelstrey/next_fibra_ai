// src/app/api/equipamentos/schema.ts

import { z } from "zod";

/**
 * Esquema para validação de criação de equipamento
 */
export const equipamentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  fabricante: z.string().min(1, "Fabricante é obrigatório"),
  numeroSerie: z.string().min(1, "Número de série é obrigatório"),
  dataInstalacao: z.string().refine((data) => {
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, {
    message: "Data de instalação inválida",
  }),
  status: z.enum(["Ativo", "Inativo", "Em manutenção", "Defeituoso"], {
    errorMap: () => ({ message: "Status deve ser Ativo, Inativo, Em manutenção ou Defeituoso" })
  }),
  tipo: z.enum(["OLT", "ONU", "Splitter", "Switch", "Roteador", "Outro"], {
    errorMap: () => ({ message: "Tipo deve ser OLT, ONU, Splitter, Switch, Roteador ou Outro" })
  }),
  descricao: z.string().optional(),
  caixaId: z.string().uuid("ID da caixa inválido").optional(),
  emendaId: z.string().uuid("ID da emenda inválido").optional(),
  clienteId: z.string().uuid("ID do cliente inválido").optional(),
}).refine(
  (data) => {
    // Pelo menos um dos IDs deve ser fornecido
    return !!data.caixaId || !!data.emendaId || !!data.clienteId;
  },
  {
    message: "Pelo menos um ID de entidade (caixaId, emendaId ou clienteId) deve ser fornecido",
    path: ["caixaId"],
  }
);

/**
 * Esquema para validação de atualização parcial de equipamento
 */
export const atualizarEquipamentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  modelo: z.string().min(1, "Modelo é obrigatório").optional(),
  fabricante: z.string().min(1, "Fabricante é obrigatório").optional(),
  numeroSerie: z.string().min(1, "Número de série é obrigatório").optional(),
  dataInstalacao: z.string().optional().refine((data) => {
    if (!data) return true;
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, {
    message: "Data de instalação inválida",
  }),
  status: z.enum(["Ativo", "Inativo", "Em manutenção", "Defeituoso"]).optional(),
  tipo: z.enum(["OLT", "ONU", "Splitter", "Switch", "Roteador", "Outro"]).optional(),
  descricao: z.string().optional(),
  caixaId: z.string().uuid("ID da caixa inválido").optional(),
  emendaId: z.string().uuid("ID da emenda inválido").optional(),
  clienteId: z.string().uuid("ID do cliente inválido").optional(),
});