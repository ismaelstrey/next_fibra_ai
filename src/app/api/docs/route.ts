import { NextResponse } from 'next/server';
import { getSwaggerJSON } from '@/docs/swagger';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Retorna a especificação OpenAPI
 *     description: Endpoint para obter a especificação OpenAPI em formato JSON
 *     tags: [Documentação]
 *     responses:
 *       200:
 *         description: Especificação OpenAPI em formato JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET() {
  // Obtém a especificação do Swagger
  const swaggerJSON = getSwaggerJSON();
  
  // Configura os cabeçalhos para permitir CORS para a documentação
  return NextResponse.json(swaggerJSON, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Content-Type': 'application/json',
    },
  });
}