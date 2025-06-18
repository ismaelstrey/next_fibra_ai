import { Prisma } from '@prisma/client';

export interface Busca {
  nome?: string;
  estado?: string;
  usuarios?: {
    some: {
      id: string,
    },
  }
    conteudo?: string;
    caixaId?: string;
    rotaId?: string;
    usuarioId?: string;
    OR?: Prisma.CidadeWhereInput[]; 

      caixa?: {
        cidadeId?: string;
        cidade?: {
          usuarios: {
            some: {
              id: string;
            };
          };
        },
       
      };
    }