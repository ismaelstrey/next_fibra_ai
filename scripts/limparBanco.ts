// Script para limpar todas as tabelas exceto Usuario e Cidade
// Execute com: pnpm tsx scripts/limparBanco.ts
import { prisma } from "../src/prisma/prisma";

async function main() {
  // Lista de modelos a serem limpos (exceto Usuario e Cidade)
  // Ordem importa devido a relações de FK
  await prisma.notificacaoLida.deleteMany();
  await prisma.notificacao.deleteMany();
  await prisma.atividade.deleteMany();
  await prisma.arquivo.deleteMany();
  await prisma.capilar.deleteMany();
  await prisma.tubo.deleteMany();
  await prisma.emenda.deleteMany();
  await prisma.fusao.deleteMany();
  await prisma.bandeja.deleteMany();
  await prisma.porta.deleteMany();
  await prisma.spliter.deleteMany();
  await prisma.incidente.deleteMany();
  await prisma.equipamento.deleteMany();
  await prisma.manutencao.deleteMany();
  await prisma.comentario.deleteMany();
  await prisma.participante.deleteMany();
  await prisma.relatorio.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.log.deleteMany();
  await prisma.configuracaoUsuario.deleteMany();
  await prisma.configuracaoGlobal.deleteMany();
  await prisma.rotaCaixa.deleteMany();
  await prisma.caixa.deleteMany();
  await prisma.rota.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.neutra.deleteMany();
  // Cidade e Usuario não são limpos
  console.log("Banco limpo com sucesso (exceto Usuario e Cidade)");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});