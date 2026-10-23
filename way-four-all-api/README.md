# Way Four All API

API Express 5 e PostgreSQL para encontrar estabelecimentos acessíveis, solicitar alterações, avaliar locais e salvar favoritos.

## Executar

Use Node.js 24 e PostgreSQL. Na pasta `way-four-all-api`:

1. Execute `npm ci`.
2. Copie `.env.example` para `.env` e configure as credenciais do banco.
3. Gere um segredo com `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"` e coloque o resultado em `JWT_SECRET`. Nunca publique o `.env`.
4. Em **banco novo**, execute `psql -h localhost -U postgres -d wayfourall -v ON_ERROR_STOP=1 -f database/schema.sql`.
5. Em **banco existente**, execute somente `psql -h localhost -U postgres -d wayfourall -v ON_ERROR_STOP=1 -f database/migrations/001_concluir_api.sql`. Faça backup antes de migrar dados importantes. A migração adiciona a coluna usada nas solicitações e favoritos, preservando os registros existentes.
6. Execute `npm run dev` ou `npm start`.

A API usa a porta 3000. `CORS_ORIGINS` aceita origens separadas por vírgula. Senhas de cadastro precisam de pelo menos 8 caracteres e no máximo 72 bytes UTF-8. JWT expira em 1 hora por padrão. O perfil atual é consultado no banco a cada requisição autenticada.

## Primeiro administrador

Defina temporariamente `ADMIN_NOME`, `ADMIN_EMAIL` e `ADMIN_SENHA` no ambiente e execute `npm run admin:create`. Remova as variáveis após o uso. O comando só permite criar o administrador inicial e serializa execuções concorrentes. Não existe cadastro público de administradores.

## Rotas

Todas as rotas abaixo têm prefixo `/api`. Nas protegidas, envie `Authorization: Bearer <token>`.

| Método e rota | Acesso | Uso |
| --- | --- | --- |
| POST `/auth/cadastro` | Público | `{ nome, email, senha }` |
| POST `/auth/login` | Público | `{ email, senha }`, retorna `token` e `usuario` |
| GET `/auth/me` | Usuário | Consulta a sessão atual |
| GET `/categorias`, `/categorias/:id` | Público | Categorias |
| POST `/categorias`, PUT/DELETE `/categorias/:id` | Admin | `{ nome }` |
| GET `/recursos`, `/recursos/:id` | Público | Recursos; filtro `tipo` |
| POST `/recursos`, PUT/DELETE `/recursos/:id` | Admin | `{ nome, descricao, tipo }` |
| GET `/estabelecimentos`, `/estabelecimentos/:id` | Público | Somente aprovados |
| GET `/admin/estabelecimentos`, `/admin/estabelecimentos/:id` | Admin | Inclui pendentes e rejeitados |
| POST `/estabelecimentos`, PUT/DELETE `/estabelecimentos/:id` | Admin | Manutenção de estabelecimentos |
| POST `/solicitacoes` | Usuário | Solicita adição, revisão ou exclusão |
| GET `/solicitacoes/minhassolicitacoes`, `/solicitacoes/minhassolicitacoes/:id` | Usuário | Somente as próprias solicitações |
| PATCH `/solicitacoes/minhassolicitacoes/:id/cancelar` | Usuário | Cancela solicitação própria pendente; enviar `{}` |
| GET `/admin/solicitacoes`, `/admin/solicitacoes/:id` | Admin | Consulta solicitações; filtros `status` e `tipo` |
| PATCH `/admin/solicitacoes/:id/aprovar` | Admin | `{ respostaAdmin? }`; aplica os dados e aprova atomicamente |
| PATCH `/admin/solicitacoes/:id/rejeitar` | Admin | `{ respostaAdmin }`, mínimo de 5 caracteres |
| GET `/admin/dashboard` | Admin | Totais do sistema |
| GET `/avaliacoes/estabelecimentos/:estabelecimentoId` | Público | Avaliações aprovadas de local aprovado |
| POST `/avaliacoes` | Usuário | `{ estabelecimentoId, nota, comentario? }`; nota inteira 1–5 |
| DELETE `/avaliacoes/:id` | Autor ou admin | Remove avaliação |
| GET `/avaliacoes/pendentes` | Admin | Fila de moderação |
| PATCH `/avaliacoes/:id/moderar` | Admin | `{ status: "aprovada" }` ou `"rejeitada"` |
| GET `/favoritos` | Usuário | Favoritos próprios |
| PUT `/favoritos/:estabelecimentoId` | Usuário | Adiciona sem duplicar; enviar `{}` |
| DELETE `/favoritos/:estabelecimentoId` | Usuário | Remove favorito próprio; retorna 204 |

Listagens de estabelecimentos, avaliações e favoritos aceitam `pagina` e `limite` (padrão 10, máximo 50). Estabelecimentos aceitam `busca`, `cidade`, `estado`, `categoriaId` e `recursoId`.

## Estabelecimentos e solicitações

Exemplo de cadastro administrativo ou conteúdo de `dadosPropostos` numa solicitação de adição:

```json
{
  "nome": "Biblioteca Central",
  "logradouro": "Rua das Flores",
  "cidade": "São Paulo",
  "estado": "SP",
  "categoriaId": 8,
  "recursos": [1, 4],
  "latitude": -23.55052,
  "longitude": -46.633308
}
```

Também são aceitos `descricao`, `telefone`, `site` (HTTP/HTTPS), `cep`, `numero`, `complemento` e `bairro`. Coordenadas devem ser números. Apenas administradores podem definir `status` (`pendente`, `aprovado`, `rejeitado`) e `verificado` (booleano). Cadastro administrativo é aprovado por padrão. Registros antigos pendentes continuam sujeitos à aprovação administrativa.

PUT exige nome e endereço obrigatórios. Campos opcionais omitidos são preservados; `null` limpa campos opcionais. `recursos` substitui a lista, `[]` remove todos e sua ausência preserva os vínculos.

Solicitação de adição: `{ "tipo": "adicao", "dadosPropostos": { ... }, "motivo": "Justificativa com ao menos dez caracteres" }`. Revisão usa `tipo: "revisao"`, `estabelecimentoId` e somente os campos alterados em `dadosPropostos`. Exclusão usa `tipo: "exclusao"`, `estabelecimentoId` e `motivo`. Aprovação aplica a alteração numa transação com bloqueio da solicitação; uma solicitação não pode ser aplicada duas vezes. Exclusão remove o estabelecimento e seus vínculos, mantendo o histórico das solicitações com referência nula.

Respostas dos cadastros, avaliações e favoritos usam `{ sucesso, mensagem, dados, meta? }`. Autenticação e solicitações preservam o formato anterior (`usuario`, `token`, `solicitacao` ou `solicitacoes`). Erros centrais incluem `sucesso: false`, `mensagem` e `erro` para compatibilidade. Envie objetos JSON em POST, PUT e PATCH, inclusive `{}` quando não houver campos.

## Validação

`npm run lint` verifica o código. `npm test` executa testes HTTP locais com banco simulado: autorização, entradas inválidas, aprovação, rollback, moderação e favoritos. Não usa o banco da aplicação.

Para executar também o teste com PostgreSQL real, defina `TEST_DATABASE_URL` apontando para um **banco de testes** e rode `npm test`. Esse teste cria e remove um schema exclusivo, verifica instalação, repetição da migração, vínculos e exclusão com histórico. Sem a variável, ele é explicitamente ignorado.

O limitador de cadastro/login é local ao processo (30 requisições por IP em 15 minutos). Para múltiplas instâncias, configure limites compartilhados no proxy. Configure HTTPS e origens reais antes da publicação. A integração visual das páginas ainda vazias do frontend não faz parte desta API.
