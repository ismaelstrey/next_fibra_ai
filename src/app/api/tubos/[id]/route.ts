import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";

// GET - Detalhes de um tubo
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    const tubo = await prisma.tubo.findUnique({
      where: { id },
      include: { capilares: true, rota: true }
    });
    if (!tubo) {
      return NextResponse.json({ erro: "Tubo não encontrado" }, { status: 404 });
    }
    return NextResponse.json(tubo);
  } catch (error) {
    return tratarErro(error);
  }
}

// PATCH - Atualiza um tubo
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;
    const tuboExistente = await prisma.tubo.findUnique({ where: { id } });
    if (!tuboExistente) {
      return NextResponse.json({ erro: "Tubo não encontrado" }, { status: 404 });
    }
    const body = await req.json();
    const { numero, quantidadeCapilares, tipo, rotaId } = body;
    const dadosAtualizacao: any = {};
    if (numero !== undefined) dadosAtualizacao.numero = numero;
    if (quantidadeCapilares !== undefined) dadosAtualizacao.quantidadeCapilares = quantidadeCapilares;
    if (tipo !== undefined) dadosAtualizacao.tipo = tipo;
    if (rotaId !== undefined) dadosAtualizacao.rotaId = rotaId;
    const tuboAtualizado = await prisma.tubo.update({
      where: { id },
      data: dadosAtualizacao,
      include: { capilares: true, rota: true }
    });
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Edição",
        entidade: "Tubo",
        entidadeId: id,
        detalhes: dadosAtualizacao
      });
    }
    return NextResponse.json({ mensagem: "Tubo atualizado com sucesso", tubo: tuboAtualizado });
  } catch (error) {
    return tratarErro(error);
  }
}

// DELETE - Remove um tubo
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;
    const tubo = await prisma.tubo.findUnique({ where: { id } });
    if (!tubo) {
      return NextResponse.json({ erro: "Tubo não encontrado" }, { status: 404 });
    }
    await prisma.tubo.delete({ where: { id } });
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Exclusão",
        entidade: "Tubo",
        entidadeId: id,
        detalhes: { numero: tubo.numero }
      });
    }
    return NextResponse.json({ mensagem: "Tubo removido com sucesso" });
  } catch (error) {
    return tratarErro(error);
  }
}