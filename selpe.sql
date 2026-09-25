CREATE DATABASE IF NOT EXISTS selpe
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE selpe;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('aluno', 'professor', 'administrador') NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alunos (
    id_aluno INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE,
    nome_completo VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    telefone VARCHAR(20),
    email VARCHAR(150),
    endereco VARCHAR(255),
    numero VARCHAR(10),
    bairro VARCHAR(100),
    cidade VARCHAR(100) DEFAULT 'Peruíbe',
    estado CHAR(2) DEFAULT 'SP',
    cep VARCHAR(9),
    nome_responsavel VARCHAR(150),
    telefone_responsavel VARCHAR(20),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_aluno_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE professores (
    id_professor INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE,
    nome_completo VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(150),
    codigo_professor VARCHAR(30) NOT NULL UNIQUE,
    especialidade VARCHAR(100),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_professor_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE modalidades (
    id_modalidade INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    faixa_etaria_minima INT,
    faixa_etaria_maxima INT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE unidades (
    id_unidade INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    endereco VARCHAR(255),
    numero VARCHAR(10),
    bairro VARCHAR(100),
    cidade VARCHAR(100) DEFAULT 'Peruíbe',
    estado CHAR(2) DEFAULT 'SP',
    cep VARCHAR(9),
    telefone VARCHAR(20),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE horarios (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana ENUM(
        'segunda',
        'terca',
        'quarta',
        'quinta',
        'sexta',
        'sabado',
        'domingo'
    ) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE turmas (
    id_turma INT AUTO_INCREMENT PRIMARY KEY,
    id_modalidade INT NOT NULL,
    id_unidade INT NOT NULL,
    id_professor INT,
    id_horario INT NOT NULL,
    nome_turma VARCHAR(100),
    limite_vagas INT DEFAULT 0,
    vagas_disponiveis INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_turma_modalidade
        FOREIGN KEY (id_modalidade)
        REFERENCES modalidades(id_modalidade)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_turma_unidade
        FOREIGN KEY (id_unidade)
        REFERENCES unidades(id_unidade)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_turma_professor
        FOREIGN KEY (id_professor)
        REFERENCES professores(id_professor)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_turma_horario
        FOREIGN KEY (id_horario)
        REFERENCES horarios(id_horario)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE inscricoes (
    id_inscricao INT AUTO_INCREMENT PRIMARY KEY,
    id_aluno INT NOT NULL,
    id_turma INT NOT NULL,
    data_inscricao DATE NOT NULL,
    status ENUM(
        'pendente',
        'ativa',
        'cancelada',
        'concluida'
    ) NOT NULL DEFAULT 'pendente',
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inscricao_aluno
        FOREIGN KEY (id_aluno)
        REFERENCES alunos(id_aluno)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_inscricao_turma
        FOREIGN KEY (id_turma)
        REFERENCES turmas(id_turma)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT uk_aluno_turma
        UNIQUE (id_aluno, id_turma)
);

CREATE TABLE frequencias (
    id_frequencia INT AUTO_INCREMENT PRIMARY KEY,
    id_inscricao INT NOT NULL,
    data_aula DATE NOT NULL,
    presente BOOLEAN NOT NULL DEFAULT FALSE,
    observacao VARCHAR(255),

    CONSTRAINT fk_frequencia_inscricao
        FOREIGN KEY (id_inscricao)
        REFERENCES inscricoes(id_inscricao)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uk_frequencia
        UNIQUE (id_inscricao, data_aula)
);
CREATE TABLE recuperacao_senha (
    id_recuperacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expira_em DATETIME NOT NULL,
    usado_em DATETIME NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_token_hash (token_hash),
    INDEX idx_usuario (id_usuario),

    CONSTRAINT fk_recuperacao_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);


INSERT INTO usuarios (login, senha, tipo)
VALUES
('aluno', '1234', 'aluno'),
('professor', '1234', 'professor');

INSERT INTO alunos (
    id_usuario,
    nome_completo,
    cpf,
    data_nascimento,
    telefone,
    email
)
VALUES (
    1,
    'Aluno Teste',
    '000.000.000-00',
    '2010-01-01',
    '(13) 99999-9999',
    'aluno@teste.com'
);

INSERT INTO professores (
    id_usuario,
    nome_completo,
    cpf,
    telefone,
    email,
    codigo_professor,
    especialidade
)
VALUES (
    2,
    'Professor Teste',
    '111.111.111-11',
    '(13) 98888-8888',
    'professor@teste.com',
    'PROF001',
    'Educação Física'
);

INSERT INTO modalidades (
    nome,
    descricao,
    faixa_etaria_minima,
    faixa_etaria_maxima
)
VALUES
('Futebol', 'Atividade esportiva de futebol', 7, 17),
('Futsal', 'Atividade esportiva de futsal', 7, 17),
('Vôlei', 'Atividade esportiva de voleibol', 10, 17),
('Basquete', 'Atividade esportiva de basquetebol', 10, 17),
('Natação', 'Atividade esportiva de natação', 7, 17);

INSERT INTO unidades (
    nome,
    endereco,
    bairro,
    cidade,
    estado
)
VALUES
(
    'Unidade Esportiva Central',
    'Endereço de teste',
    'Centro',
    'Peruíbe',
    'SP'
),
(
    'Unidade Esportiva Norte',
    'Endereço de teste',
    'Bairro Norte',
    'Peruíbe',
    'SP'
);

INSERT INTO horarios (
    dia_semana,
    hora_inicio,
    hora_fim
)
VALUES
('segunda', '08:00:00', '09:00:00'),
('segunda', '09:00:00', '10:00:00'),
('terca', '14:00:00', '15:00:00'),
('quarta', '15:00:00', '16:00:00'),
('quinta', '16:00:00', '17:00:00'),
('sexta', '17:00:00', '18:00:00');

INSERT INTO turmas (
    id_modalidade,
    id_unidade,
    id_professor,
    id_horario,
    nome_turma,
    limite_vagas,
    vagas_disponiveis
)
VALUES (
    1,
    1,
    1,
    1,
    'Futebol - Turma A',
    30,
    30
);

INSERT INTO inscricoes (
    id_aluno,
    id_turma,
    data_inscricao,
    status
)
VALUES (
    1,
    1,
    CURDATE(),
    'ativa'
);
