1. Gestão Geográfica (Cidade & Mapa)
 Cadastro e gerenciamento de cidades.

 Seleção de cidade para visualizar mapa.

 Integração com mapas (Google Maps, Leaflet, Mapbox, etc.).

 Visualização em camadas: ruas, bairros, infraestrutura.

🧵 2. Roteamento de Cabos de Fibra Óptica
 Desenhar rotas de cabos sobre o mapa com ferramentas de desenho (linha, curva, clique por pontos).

 Seleção do tipo de cabo (6, 12, 24, 48, 96 vias).

 Representação visual com cores específicas por tipo de cabo.

 Nomeação personalizada de rotas (ex: "Backbone Principal Centro").

 Cadastro de informações técnicas da rota (tipo de cabo, fabricante, distância, observações).

 Registro de profundidade e tipo de passagem (posteado, subterrâneo, aéreo).

🔌 2.1. Especificações de Cabos de Fibra Óptica (ABNT NBR 14771)

 Estrutura dos cabos por quantidade de fibras:
   - Cabos de 2 a 12 fibras: 2 fibras por tubo loose (exceto cabos de tubo único)
   - Cabos de 18 a 36 fibras: 6 fibras por tubo loose
   - Cabos de 48 a 288 fibras: 12 fibras por tubo loose

 Exemplos de configuração de tubos:
   - Cabo de 6 FO (tubo único): 1 tubo com 6 fibras (muito usado no Brasil)
   - Cabo de 6 FO (múltiplos tubos): 3 tubos com 2 fibras cada
   - Cabo de 12 FO (tubo único): 1 tubo com 12 fibras (muito usado no Brasil)
   - Cabo de 12 FO (múltiplos tubos): 6 tubos com 2 fibras cada
   - Cabo de 24 FO: 2 tubos com 12 fibras cada
   - Cabo de 36 FO: 6 tubos com 6 fibras cada
   - Cabo de 48 FO: 4 tubos com 12 fibras cada
   - Cabo de 72 FO: 6 tubos com 12 fibras cada
   - Cabo de 144 FO: 12 tubos com 12 fibras cada

 Código de cores das fibras (Padrão ABNT):
   1. Verde
   2. Amarela
   3. Branca
   4. Azul
   5. Vermelha
   6. Violeta
   7. Marrom
   8. Rosa
   9. Preta
   10. Cinza
   11. Laranja
   12. Água-marinha

 Código de cores das fibras (Padrão EIA/TIA - Americano):
   1. Azul
   2. Laranja
   3. Verde
   4. Marrom
   5. Cinza
   6. Branco
   7. Vermelho
   8. Preto
   9. Amarelo
   10. Violeta
   11. Rosa
   12. Água-marinha
   13. Oliva (apenas em cabos múltiplos de 16 fibras)
   14. Magenta (apenas em cabos múltiplos de 16 fibras)
   15. Bronzeado (apenas em cabos múltiplos de 16 fibras)
   16. Lima (apenas em cabos múltiplos de 16 fibras)

 Código de cores dos tubos loose (Padrão ABNT):
   1. Verde ("piloto")
   2. Amarelo ("direcional")
   3+ Branco/Natural (demais tubos)

 Código de cores dos tubos loose (Padrão EIA/TIA - Americano):
   - Segue a mesma sequência de cores das fibras

 Identificação dos tubos no padrão ABNT:
   - Tubo verde ("piloto"): sempre o tubo 1
   - Tubo amarelo ("direcional"): sempre o tubo 2, determina o sentido de contagem
   - Demais tubos: contados no sentido horário ou anti-horário a partir do tubo "direcional"

🔀 2.2. Splitters Ópticos

 Splitters Balanceados (divisão igual de potência):
   - Splitter 1:2 - Perda de inserção: 3,5 dB
   - Splitter 1:4 - Perda de inserção: 7,0 dB
   - Splitter 1:8 - Perda de inserção: 10,5 dB
   - Splitter 1:16 - Perda de inserção: 13,5 dB
   - Splitter 1:32 - Perda de inserção: 17,0 dB
   - Splitter 1:64 - Perda de inserção: 20,5 dB
   - Splitter 1:128 - Perda de inserção: 23,5 dB

 Splitters Desbalanceados (divisão desigual de potência):
   - Splitter 1:2 (90%/10%) - Perda de inserção: 0,8 dB (90%) e 10,5 dB (10%)
   - Splitter 1:2 (80%/20%) - Perda de inserção: 1,2 dB (80%) e 7,5 dB (20%)
   - Splitter 1:2 (70%/30%) - Perda de inserção: 1,8 dB (70%) e 5,6 dB (30%)
   - Splitter 1:2 (60%/40%) - Perda de inserção: 2,5 dB (60%) e 4,3 dB (40%)

 Aplicações típicas:
   - Splitters balanceados: Redes PON padrão, distribuição uniforme para múltiplos assinantes
   - Splitters desbalanceados: Monitoramento de rede, extensão de alcance, derivação de sinal para medições

📦 3. Caixas de Atendimento (CTO)
 Adição de caixas de atendimento ao longo da rota.

 Cadastro de modelo da caixa e capacidade (ex: 8 portas, 16 portas).

 Associação da CTO à rota de cabo.

 Representação visual da CTO no mapa (ícone com tooltip).

 Diagrama de ligação dos clientes nas portas da CTO.

🧰 4. Caixas de Emenda (CEO)
 Inserção de caixas de emenda no mapa.

 Cadastro do modelo da caixa e quantidade de bandejas.

 Diagrama de fusão por bandeja (ex: fibras 1-12, 13-24, etc).

 Associação com rotas de cabo que passam ou terminam ali.

 Histórico de manutenções e fusões.

🧮 5. Diagrama de Fusão
 Visual editor para fusões por bandeja e tubo.

 Associação de fibras entre cabos diferentes (com cor e número).

 Registro de status da fusão (ativo, reserva, fusão programada).

 Exportação em PDF/impressão do diagrama.

🔧 6. Gerenciamento Técnico
 Cadastro de engenheiros e técnicos com níveis de permissão.

 Registro de alterações por usuário (log de edição).

 Comentários em elementos (caixa, cabo, rota).

 Upload de fotos ou arquivos (ex: relatório, projeto civil).

🔍 7. Visualização e Filtros
 Filtros por cidade, tipo de cabo, status (ativo/em manutenção).

 Busca por rota, código da caixa, ou endereço.

 Camadas ativáveis: cabos, CTOs, CEOs, clientes.

📤 8. Exportações e Relatórios
 Exportar dados por cidade ou projeto em PDF ou CSV.

 Geração de relatórios de infraestrutura por área.

 Impressão de mapas com rotas e diagramas.

🔐 9. Autenticação e Controle de Acesso
 Login com controle de permissões por função (engenheiro, técnico, gerente).

 Logs de auditoria (quem criou/editou o quê e quando).

 Recuperação de senha e autenticação em 2 etapas (opcional).

📦 10. Extras (Futuras melhorias)
 Integração com sistema de inventário de materiais.

 Integração com sistema de atendimento ao cliente (OSS/BSS).

 Cálculo automático de perda óptica por rota.

 Diagrama visual de cores dos tubos e fibras conforme padrões ABNT e EIA/TIA.

 Paleta de cores para representação visual (Padrão ABNT):
   - Verde: #008000
   - Amarela: #FFFF00
   - Branca: #FFFFFF
   - Azul: #0000FF
   - Vermelha: #FF0000
   - Violeta: #8A2BE2
   - Marrom: #A52A2A
   - Rosa: #FFC0CB
   - Preta: #000000
   - Cinza: #808080
   - Laranja: #FFA500
   - Água-marinha: #7FFFD4