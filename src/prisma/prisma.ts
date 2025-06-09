// src/prisma/prisma.ts

import { PrismaClient } from '@prisma/client';


// Exporta uma instância do PrismaClient como um singleton
export const prisma = new PrismaClient();

async function main() {

}

main()
    .then(async () => {
        console.log("Prisma desconectadndo")
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

