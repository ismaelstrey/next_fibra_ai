// src/app/api/manutencoes/schema.ts

import { z } from "zod";

/**
 * Esquema base para manutenção sem refinamentos
 */
const manutencaoSchemaBase = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  dataManutencao: z.string().refine((data) => {
    const dataObj = new Date(data);
    return !isNaN(dataObj.getTime());
  }, {
    message: "Data de manutenção inválida",
  }),
  dataInicio: z.string().refine((data) => {
    const dataObj = new Date(data);
    return !isNaN(dataObj.getTime());
  }, {
    message: "Data de início inválida",
  }),
  status: z.enum(["Agendada", "Em Andamento", "Concluída", "Cancelada"], {
    errorMap: () => ({ message: "Status deve ser Agendada, Em Andamento, Concluída ou Cancelada" })
  }),
  tipo: z.enum(["Preventiva", "Corretiva", "Emergencial"], {
    errorMap: () => ({ message: "Tipo deve ser Preventiva, Corretiva ou Emergencial" })
  }),
  prioridade: z.enum(["Baixa", "Média", "Alta", "Crítica"], {
    errorMap: () => ({ message: "Prioridade deve ser Baixa, Média, Alta ou Crítica" })
  }),
  cidadeId: z.string(),
  caixaId: z.string().optional(),
  rotaId: z.string().optional(),
});

/**
 * Esquema para criação e atualização de manutenção
 */
export const manutencaoSchema = manutencaoSchemaBase.refine(
  data => data.caixaId || data.rotaId,
  {
    message: "Deve ser especificado pelo menos uma caixa ou uma rota",
    path: ["caixaId"],
  }
);

/**
 * Esquema para atualização parcial de manutenção
 */
export const atualizarManutencaoSchema = manutencaoSchemaBase
  .partial()
  .refine(
    data => {
      // Se ambos estiverem presentes, pelo menos um deve ter valor
      if ('caixaId' in data && 'rotaId' in data) {
        return data.caixaId || data.rotaId;
      }
      // Se apenas um estiver presente, não precisa validar
      return true;
    },
    {
      message: "Deve ser especificado pelo menos uma caixa ou uma rota",
      path: ["caixaId"],
    }
  );