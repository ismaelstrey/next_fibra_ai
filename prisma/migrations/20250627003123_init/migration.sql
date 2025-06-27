-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT,
    "cargo" TEXT DEFAULT 'Operador',
    "imagem" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cidade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "coordenadas" JSONB,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Rota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipoCabo" TEXT NOT NULL,
    "fabricante" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "distancia" REAL,
    "profundidade" REAL,
    "tipoPassagem" TEXT NOT NULL,
    "coordenadas" JSONB NOT NULL,
    "cor" TEXT,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "cidadeId" TEXT NOT NULL,
    CONSTRAINT "Rota_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Caixa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "coordenadas" JSONB NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "cidadeId" TEXT NOT NULL,
    CONSTRAINT "Caixa_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Porta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "clienteNome" TEXT,
    "clienteId" TEXT,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "caixaId" TEXT NOT NULL,
    "spliterId" TEXT,
    CONSTRAINT "Porta_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Porta_spliterId_fkey" FOREIGN KEY ("spliterId") REFERENCES "Spliter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bandeja" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "observacoes" TEXT,
    "status" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "caixaId" TEXT NOT NULL,
    CONSTRAINT "Bandeja_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Fusao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fibraOrigem" INTEGER NOT NULL,
    "fibraDestino" INTEGER NOT NULL,
    "tuboOrigem" TEXT,
    "tuboDestino" TEXT,
    "status" TEXT NOT NULL,
    "cor" TEXT,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "rotaOrigemId" TEXT NOT NULL,
    "caixaId" TEXT NOT NULL,
    "bandejaId" TEXT,
    CONSTRAINT "Fusao_bandejaId_fkey" FOREIGN KEY ("bandejaId") REFERENCES "Bandeja" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Fusao_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Fusao_rotaOrigemId_fkey" FOREIGN KEY ("rotaOrigemId") REFERENCES "Rota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Manutencao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataInicio" DATETIME NOT NULL,
    "titulo" TEXT NOT NULL,
    "dataFim" DATETIME,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "dataManutencao" DATETIME,
    "cidadeId" TEXT NOT NULL,
    "rotaId" TEXT NOT NULL,
    "caixaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "responsavelId" TEXT,
    CONSTRAINT "Manutencao_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Responsavel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Responsavel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Comentario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "texto" TEXT NOT NULL,
    "conteudo" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "rotaId" TEXT,
    "caixaId" TEXT,
    "manutencaoId" TEXT,
    "eventoId" TEXT,
    "relatorioId" TEXT,
    CONSTRAINT "Comentario_relatorioId_fkey" FOREIGN KEY ("relatorioId") REFERENCES "Relatorio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comentario_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comentario_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comentario_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comentario_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comentario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Arquivo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rotaId" TEXT,
    "caixaId" TEXT,
    "manutencaoId" TEXT,
    "eventoId" TEXT,
    "relatorioId" TEXT,
    "tamanho" INTEGER,
    "usuarioId" TEXT,
    "capilarId" TEXT,
    "emendaId" TEXT,
    "clienteId" TEXT,
    "equipamentoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Arquivo_relatorioId_fkey" FOREIGN KEY ("relatorioId") REFERENCES "Relatorio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_capilarId_fkey" FOREIGN KEY ("capilarId") REFERENCES "Capilar" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_emendaId_fkey" FOREIGN KEY ("emendaId") REFERENCES "Emenda" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "detalhes" JSONB,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "Log_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atividade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "entidade" TEXT,
    "entidadeId" TEXT,
    "detalhes" JSONB,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "Atividade_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfiguracaoGlobal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chave" TEXT NOT NULL,
    "valor" JSONB NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'geral',
    "editavel" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConfiguracaoUsuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chave" TEXT NOT NULL,
    "valor" JSONB NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "ConfiguracaoUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "cidadeId" TEXT,
    "caixaId" TEXT,
    "rotaId" TEXT,
    "manutencaoId" TEXT,
    "eventoId" TEXT,
    "relatorioId" TEXT,
    "criadorId" TEXT NOT NULL,
    "cargoDestinatarios" TEXT NOT NULL,
    CONSTRAINT "Notificacao_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Notificacao_relatorioId_fkey" FOREIGN KEY ("relatorioId") REFERENCES "Relatorio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notificacao_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notificacao_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notificacao_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notificacao_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notificacao_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificacaoLida" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "lidaEm" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificacaoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "NotificacaoLida_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NotificacaoLida_notificacaoId_fkey" FOREIGN KEY ("notificacaoId") REFERENCES "Notificacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "localizacao" TEXT,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME,
    "prioridade" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "cidadeId" TEXT,
    "rotaId" TEXT,
    "caixaId" TEXT,
    "usuarioId" TEXT,
    CONSTRAINT "Evento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Evento_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Evento_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Evento_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Relatorio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME NOT NULL,
    "dados" JSONB,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "cidadeId" TEXT,
    "caixaId" TEXT,
    "rotaId" TEXT,
    "manutencaoId" TEXT,
    "criadorId" TEXT NOT NULL,
    CONSTRAINT "Relatorio_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relatorio_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Relatorio_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Relatorio_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Relatorio_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Participante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Capilar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "comprimento" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "potencia" REAL NOT NULL,
    "cidadeId" TEXT,
    CONSTRAINT "Capilar_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Emenda" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "localizacao" TEXT NOT NULL,
    "capilarSaidaId" TEXT NOT NULL,
    "capilarEntradaId" TEXT NOT NULL,
    "cidadeId" TEXT,
    CONSTRAINT "Emenda_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Emenda_capilarSaidaId_fkey" FOREIGN KEY ("capilarSaidaId") REFERENCES "Capilar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Emenda_capilarEntradaId_fkey" FOREIGN KEY ("capilarEntradaId") REFERENCES "Capilar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "senha" TEXT,
    "telefone" TEXT,
    "cpf" TEXT,
    "apartamento" TEXT,
    "endereco" TEXT,
    "casa" TEXT,
    "numero" INTEGER NOT NULL,
    "potencia" REAL NOT NULL,
    "wifi" TEXT,
    "senhaWifi" TEXT,
    "neutraId" TEXT,
    "cidadeId" TEXT,
    "portaId" TEXT NOT NULL,
    CONSTRAINT "Cliente_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cliente_neutraId_fkey" FOREIGN KEY ("neutraId") REFERENCES "Neutra" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cliente_portaId_fkey" FOREIGN KEY ("portaId") REFERENCES "Porta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Neutra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "vlan" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Spliter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "atendimento" BOOLEAN NOT NULL DEFAULT true,
    "tipo" TEXT NOT NULL,
    "caixaId" TEXT NOT NULL,
    "capilarSaidaId" TEXT,
    "capilarEntradaId" TEXT,
    CONSTRAINT "Spliter_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Spliter_capilarSaidaId_fkey" FOREIGN KEY ("capilarSaidaId") REFERENCES "Capilar" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Spliter_capilarEntradaId_fkey" FOREIGN KEY ("capilarEntradaId") REFERENCES "Capilar" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Equipamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "fabricante" TEXT NOT NULL,
    "numeroSerie" TEXT,
    "dataInstalacao" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "caixaId" TEXT,
    "emendaId" TEXT,
    "clienteId" TEXT,
    "usuarioId" TEXT,
    "cidadeId" TEXT,
    CONSTRAINT "Equipamento_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_emendaId_fkey" FOREIGN KEY ("emendaId") REFERENCES "Emenda" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Incidente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataOcorrencia" DATETIME NOT NULL,
    "dataResolucao" DATETIME,
    "status" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "impacto" TEXT NOT NULL,
    "solucao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "caixaId" TEXT,
    "capilarId" TEXT,
    "emendaId" TEXT,
    "clienteId" TEXT,
    "equipamentoId" TEXT,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "Incidente_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incidente_capilarId_fkey" FOREIGN KEY ("capilarId") REFERENCES "Capilar" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incidente_emendaId_fkey" FOREIGN KEY ("emendaId") REFERENCES "Emenda" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incidente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incidente_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incidente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RotaCaixa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rotaId" TEXT NOT NULL,
    "caixaId" TEXT NOT NULL,
    "tipoConexao" TEXT NOT NULL,
    "ordem" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "RotaCaixa_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RotaCaixa_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CidadeToUsuario" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CidadeToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "Cidade" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CidadeToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_notificacoesRecebidas" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_notificacoesRecebidas_A_fkey" FOREIGN KEY ("A") REFERENCES "Notificacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_notificacoesRecebidas_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EventoToManutencao" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EventoToManutencao_A_fkey" FOREIGN KEY ("A") REFERENCES "Evento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EventoToManutencao_B_fkey" FOREIGN KEY ("B") REFERENCES "Manutencao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EventoToParticipante" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EventoToParticipante_A_fkey" FOREIGN KEY ("A") REFERENCES "Evento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EventoToParticipante_B_fkey" FOREIGN KEY ("B") REFERENCES "Participante" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ParticipanteToUsuario" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ParticipanteToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "Participante" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ParticipanteToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ParticipanteToRelatorio" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ParticipanteToRelatorio_A_fkey" FOREIGN KEY ("A") REFERENCES "Participante" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ParticipanteToRelatorio_B_fkey" FOREIGN KEY ("B") REFERENCES "Relatorio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CapilarToRota" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CapilarToRota_A_fkey" FOREIGN KEY ("A") REFERENCES "Capilar" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CapilarToRota_B_fkey" FOREIGN KEY ("B") REFERENCES "Rota" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracaoGlobal_chave_key" ON "ConfiguracaoGlobal"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracaoUsuario_usuarioId_chave_key" ON "ConfiguracaoUsuario"("usuarioId", "chave");

-- CreateIndex
CREATE UNIQUE INDEX "NotificacaoLida_notificacaoId_usuarioId_key" ON "NotificacaoLida"("notificacaoId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RotaCaixa_rotaId_caixaId_key" ON "RotaCaixa"("rotaId", "caixaId");

-- CreateIndex
CREATE UNIQUE INDEX "_CidadeToUsuario_AB_unique" ON "_CidadeToUsuario"("A", "B");

-- CreateIndex
CREATE INDEX "_CidadeToUsuario_B_index" ON "_CidadeToUsuario"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_notificacoesRecebidas_AB_unique" ON "_notificacoesRecebidas"("A", "B");

-- CreateIndex
CREATE INDEX "_notificacoesRecebidas_B_index" ON "_notificacoesRecebidas"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EventoToManutencao_AB_unique" ON "_EventoToManutencao"("A", "B");

-- CreateIndex
CREATE INDEX "_EventoToManutencao_B_index" ON "_EventoToManutencao"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EventoToParticipante_AB_unique" ON "_EventoToParticipante"("A", "B");

-- CreateIndex
CREATE INDEX "_EventoToParticipante_B_index" ON "_EventoToParticipante"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ParticipanteToUsuario_AB_unique" ON "_ParticipanteToUsuario"("A", "B");

-- CreateIndex
CREATE INDEX "_ParticipanteToUsuario_B_index" ON "_ParticipanteToUsuario"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ParticipanteToRelatorio_AB_unique" ON "_ParticipanteToRelatorio"("A", "B");

-- CreateIndex
CREATE INDEX "_ParticipanteToRelatorio_B_index" ON "_ParticipanteToRelatorio"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CapilarToRota_AB_unique" ON "_CapilarToRota"("A", "B");

-- CreateIndex
CREATE INDEX "_CapilarToRota_B_index" ON "_CapilarToRota"("B");
