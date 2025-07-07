import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";

// GET - Lista todos os tubos
export async function GET(req: NextRequest) {
  try {
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const rotaId = searchParams.get("rotaId");
    const tipo = searchParams.get("tipo");
    const numero = searchParams.get("numero");
    const where: any = {};
    if (rotaId) where.rotaId = rotaId;
    if (tipo) where.tipo = tipo;
    if (numero) where.numero = Number(numero);
    const tubos = await prisma.tubo.findMany({
      where,
      include: {
        capilares: true,
        rota: true
      }
    });
    return NextResponse.json(tubos);
  } catch (error) {
    return tratarErro(error);
  }
}

// POST - Cria um novo tubo
export async function POST(req: NextRequest) {
  try {
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;
    const body = await req.json();
    const { numero, quantidadeCapilares, tipo, rotaId } = body;
    const novoTubo = await prisma.tubo.create({
      data: { numero, quantidadeCapilares, tipo, rotaId },
      include: { capilares: true, rota: true }
    });
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Criação",
        entidade: "Tubo",
        entidadeId: novoTubo.id,
        detalhes: { numero, quantidadeCapilares, tipo, rotaId }
      });
    }
    return NextResponse.json({ mensagem: "Tubo criado com sucesso", tubo: novoTubo }, { status: 201 });
  } catch (error) {
    return tratarErro(error);
  }
}