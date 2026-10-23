CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(30) NOT NULL DEFAULT 'usuario',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE estabelecimentos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(180) NOT NULL,
    descricao TEXT,
    categoria_id INTEGER REFERENCES categorias(id),
    telefone VARCHAR(30),
    site VARCHAR(255),

    cep VARCHAR(10),
    logradouro VARCHAR(180) NOT NULL,
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,

    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),

    status VARCHAR(30) NOT NULL DEFAULT 'pendente',
    verificado BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recursos_acessibilidade (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL UNIQUE,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL
);

CREATE TABLE estabelecimento_recursos (
    estabelecimento_id INTEGER NOT NULL
        REFERENCES estabelecimentos(id)
        ON DELETE CASCADE,

    recurso_id INTEGER NOT NULL
        REFERENCES recursos_acessibilidade(id)
        ON DELETE CASCADE,

    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    observacao TEXT,
    verificado BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (estabelecimento_id, recurso_id)
);

CREATE TABLE avaliacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    estabelecimento_id INTEGER NOT NULL
        REFERENCES estabelecimentos(id)
        ON DELETE CASCADE,

    nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categorias (nome)
VALUES
  ('Restaurante'),
  ('Praça'),
  ('Banco'),
  ('Cinema'),
  ('Laboratório'),
  ('Clínica médica'),
  ('Hospital'),
  ('Biblioteca'),
  ('Consultório odontológico'),
  ('Escola'),
  ('Mercado'),
  ('Hotel'),
  ('Parque'),
  ('Órgão público'),
  ('Shopping'),
  ('Unidade Básica de Saúde (UBS)')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO recursos_acessibilidade (nome, descricao, tipo) VALUES
(
    'Rampa de acesso',
    'Entrada com rampa adequada para pessoas com mobilidade reduzida',
    'fisica'
),
(
    'Banheiro acessível',
    'Banheiro adaptado para pessoas com deficiência',
    'fisica'
),
(
    'Elevador',
    'Elevador disponível para acesso entre os andares',
    'fisica'
),
(
    'Piso tátil',
    'Piso com sinalização tátil para orientação',
    'visual'
),
(
    'Sinalização em braile',
    'Informações apresentadas em braile',
    'visual'
),
(
    'Atendimento em Libras',
    'Profissional disponível para atendimento em Libras',
    'auditiva'
),
(
    'Ambiente com poucos estímulos',
    'Espaço com redução de ruídos, luzes e estímulos sensoriais',
    'sensorial'
);

CREATE TABLE IF NOT EXISTS solicitacoes_estabelecimentos (
    id SERIAL PRIMARY KEY,

    usuario_id INTEGER NOT NULL
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    estabelecimento_id INTEGER
        REFERENCES estabelecimentos(id)
        ON DELETE SET NULL,

    tipo VARCHAR(20) NOT NULL,

    dados_propostos JSONB,

    motivo TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'pendente',

    resposta_admin TEXT,

    analisado_por INTEGER
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    analisado_em TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT solicitacao_tipo_valido
        CHECK (tipo IN ('adicao', 'revisao', 'exclusao')),

    CONSTRAINT solicitacao_status_valido
        CHECK (
            status IN (
                'pendente',
                'aprovada',
                'rejeitada',
                'cancelada'
            )
        ),

    CONSTRAINT solicitacao_dados_obrigatorios
        CHECK (
            (
                tipo IN ('adicao', 'revisao')
                AND dados_propostos IS NOT NULL
            )
            OR tipo = 'exclusao'
        )
);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_usuario
ON solicitacoes_estabelecimentos (usuario_id);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_status
ON solicitacoes_estabelecimentos (status);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_estabelecimento
ON solicitacoes_estabelecimentos (estabelecimento_id);

CREATE TABLE IF NOT EXISTS favoritos (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    estabelecimento_id INTEGER NOT NULL REFERENCES estabelecimentos(id) ON DELETE CASCADE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, estabelecimento_id)
);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_estabelecimento_status ON avaliacoes (estabelecimento_id, status);
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_status ON estabelecimentos (status);
