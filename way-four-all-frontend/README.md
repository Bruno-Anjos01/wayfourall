# Way Four All — Frontend

Interface React + Vite baseada na referência de design fornecida. A marca oficial está em public/images/logo-way-four-all.png; o componente Logo apresenta o arquivo original com janelas CSS, sem modificar o desenho. A foto principal é uma imagem ilustrativa gerada para o projeto, não a foto de um estabelecimento cadastrado.

## Executar localmente

Use Node.js 24. Instale as dependências com npm ci.

1. Inicie a API na pasta ../way-four-all-api com npm start.
2. Configure VITE_API_URL=/api no arquivo .env (veja .env.example).
3. Execute npm run dev e abra a URL mostrada pelo Vite.

O Vite encaminha /api para http://127.0.0.1:3000. Isso evita conflitos de CORS entre localhost e 127.0.0.1 durante o desenvolvimento. npm run preview também oferece esse proxy local.

Em produção, publique dist e configure o servidor para encaminhar /api à API e retornar index.html nas rotas do React. Se a API estiver em outro domínio, defina VITE_API_URL com a URL completa terminada em /api antes do build e autorize a origem no CORS da API. Variáveis VITE_ são públicas: nunca coloque segredos nelas.

## Funcionalidades

- Página inicial responsiva, marca oficial, foto ilustrativa e atalhos de categorias disponíveis.
- Busca com texto, categoria, cidade, recurso de acessibilidade e paginação.
- Mapa Leaflet/OpenStreetMap com marcadores dos registros que possuem coordenadas.
- Detalhes de estabelecimentos, recursos informados, avaliações e compartilhamento do link.
- Cadastro, login, restauração da sessão pela API e saída automática após 401.
- Rotas privadas, favoritos, indicação de locais, revisão/exclusão solicitada e acompanhamento/cancelamento das próprias solicitações.
- Conta e preferências de acessibilidade salvas neste navegador por usuário.
- Administração: resumo, revisão de estabelecimentos existentes, aprovação/rejeição de solicitações e moderação de avaliações.
- Páginas informativas, estado vazio, erro, carregamento e página não encontrada.
- Foco visível, rótulos de campos, link para pular ao conteúdo, navegação mobile e respeito à preferência de movimento reduzido.

## Dependências funcionais e limites

A API deve conter as implementações da pasta irmã. A migração database/migrations/001_concluir_api.sql foi aplicada ao banco local way_four_all com autorização do responsável. As tabelas de favoritos e avaliações foram verificadas, sem alteração na quantidade de usuários, estabelecimentos ou solicitações existentes. Em outros ambientes, aplique a migração antes de usar esses módulos. Nenhuma migração é executada pelo frontend.

O mapa público mostra somente estabelecimentos aprovados. Uma lista vazia pode significar que os registros ainda precisam de análise administrativa. Não são inseridos locais, avaliações ou estatísticas fictícias para preencher a interface. As condições de acessibilidade são informadas, não garantias técnicas.

A navegação abre o Google Maps com o destino; não oferece cálculo próprio de trajeto acessível nem estimativas inventadas. O mapa depende de conexão com o OpenStreetMap. O serviço de mapas deve ser dimensionado conforme a política do provedor antes de um lançamento de grande tráfego.

Login social, recuperação de senha, alteração dos dados do perfil e upload de fotos não são oferecidos porque a API atual não possui esses contratos. As preferências são locais ao navegador, não sincronizadas; o usuário seleciona os filtros na busca. O texto de privacidade descreve a implementação atual e precisa dos canais oficiais do responsável antes da publicação.

## Verificar

- npm run build: compilação de produção.
- npm run lint: análise estática do código.
- npm test: testes dos dados enviados nos formulários, preservação de recursos em revisão parcial, exclusão e entradas inválidas.

Validação visual realizada no navegador em desktop e em viewport de 390 px. Busca, opções vindas da API, mensagem de login inválido e proteção de rotas devem ser verificados com o servidor ativo. Para verificar fluxos autenticados completos, entre com uma conta de teste e um administrador; não use dados pessoais ou alterações administrativas reais para QA.

## Organização

src/pages contém as telas; src/components reúne os elementos reutilizáveis; src/hooks/useRemote.js concentra carregamento, erros e cancelamento de consultas; src/contexts/AuthProvider.jsx controla a sessão; src/utils/solicitacao.js monta propostas sem apagar dados omitidos; src/styles/globals.css define o visual e seus breakpoints.
