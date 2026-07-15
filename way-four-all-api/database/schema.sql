CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(30) NOT NULL DEFAULT 'usuario',
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

INSERT INTO categorias (nome) VALUES
('Restaurante'),
('Hospital'),
('Escola'),
('Mercado'),
('Hotel'),
('Parque'),
('Órgão público'),
('Espaço cultural');

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