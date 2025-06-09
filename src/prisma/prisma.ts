// src/prisma/prisma.ts

import { PrismaClient } from '@prisma/client';


// Exporta uma instância do PrismaClient como um singleton
export const prisma =  new PrismaClient();

