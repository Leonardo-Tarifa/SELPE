CREATE DATABASE IF NOT EXISTS selpe_bd;
USE selpe_bd;

CREATE TABLE endereco (
    id_endereco INT PRIMARY KEY AUTO_INCREMENT,
    rua VARCHAR(100) NOT NULL,
    numero INT NOT NULL,
    bairro VARCHAR(60) NOT NULL,
    complemento VARCHAR(100),
    CEP CHAR(8) NOT NULL,
    referencia VARCHAR(100),
    cidade VARCHAR(60) DEFAULT 'Peruíbe',
    estado CHAR(2) DEFAULT 'SP'
);

CREATE TABLE responsavel (
    id_responsavel INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(11) NOT NULL,
    CPF CHAR(11) UNIQUE
);

CREATE TABLE associacoes (
    id_associacao INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    razao_social VARCHAR(200),
    cnpj CHAR(14) UNIQUE,
    tipo ENUM('ASSOCIACAO','INSTITUTO','CLUBE','ONG','OUTRO')
        NOT NULL DEFAULT 'OUTRO',
    id_endereco INT,
    telefone VARCHAR(20),
    email VARCHAR(150),
    nome_representante VARCHAR(150),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_endereco) REFERENCES endereco(id_endereco)
        ON DELETE SET NULL
);

CREATE TABLE usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    login VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('ALUNO','MONITOR','COORDENADOR','SECRETARIA')
        NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE secretaria (
    id_secretaria INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(11) NOT NULL,
    CPF CHAR(11) NOT NULL UNIQUE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE aluno (
    id_aluno INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(11) NOT NULL,
    CPF CHAR(11) NOT NULL UNIQUE,
    email VARCHAR(150),
    data_nascimento DATE,
    id_endereco INT,
    id_responsavel INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (id_endereco) REFERENCES endereco(id_endereco)
        ON DELETE SET NULL,
    FOREIGN KEY (id_responsavel) REFERENCES responsavel(id_responsavel)
        ON DELETE SET NULL
);

CREATE TABLE professor (
    id_professor INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(11) NOT NULL,
    CPF CHAR(11) NOT NULL UNIQUE,
    id_endereco INT,
    id_associacao INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (id_endereco) REFERENCES endereco(id_endereco)
        ON DELETE SET NULL,
    FOREIGN KEY (id_associacao) REFERENCES associacoes(id_associacao)
        ON DELETE SET NULL
);

CREATE TABLE monitor (
    id_monitor INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(11) NOT NULL,
    CPF CHAR(11) NOT NULL UNIQUE,
    id_endereco INT,
    id_associacao INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (id_endereco) REFERENCES endereco(id_endereco)
        ON DELETE SET NULL,
    FOREIGN KEY (id_associacao) REFERENCES associacoes(id_associacao)
        ON DELETE SET NULL
);

CREATE TABLE coordenador (
    id_coordenador INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(11) NOT NULL,
    CPF CHAR(11) NOT NULL UNIQUE,
    id_endereco INT,
    id_associacao INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (id_endereco) REFERENCES endereco(id_endereco)
        ON DELETE SET NULL,
    FOREIGN KEY (id_associacao) REFERENCES associacoes(id_associacao)
        ON DELETE SET NULL
);

CREATE TABLE modalidades (
    id_modalidade INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    faixa_etaria_min INT,
    faixa_etaria_max INT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE unidades (
    id_unidade INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    id_endereco INT,
    telefone VARCHAR(20),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_endereco) REFERENCES endereco(id_endereco)
        ON DELETE SET NULL
);

CREATE TABLE horarios (
    id_horario INT PRIMARY KEY AUTO_INCREMENT,
    dia_semana ENUM(
        'SEGUNDA','TERCA','QUARTA','QUINTA',
        'SEXTA','SABADO','DOMINGO'
    ) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (hora_fim > hora_inicio)
);

CREATE TABLE turmas (
    id_turma INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    id_modalidade INT NOT NULL,
    id_unidade INT NOT NULL,
    id_horario INT NOT NULL,
    id_monitor INT,
    id_professor INT,
    capacidade INT,
    faixa_etaria_min INT,
    faixa_etaria_max INT,
    data_inicio DATE,
    data_fim DATE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_modalidade) REFERENCES modalidades(id_modalidade),
    FOREIGN KEY (id_unidade) REFERENCES unidades(id_unidade),
    FOREIGN KEY (id_horario) REFERENCES horarios(id_horario),
    FOREIGN KEY (id_monitor) REFERENCES monitor(id_monitor)
        ON DELETE SET NULL,
    FOREIGN KEY (id_professor) REFERENCES professor(id_professor)
        ON DELETE SET NULL,
    CHECK (capacidade IS NULL OR capacidade > 0),
    CHECK (
        faixa_etaria_min IS NULL
        OR faixa_etaria_max IS NULL
        OR faixa_etaria_max >= faixa_etaria_min
    )
);

CREATE TABLE inscricoes (
    id_inscricao INT PRIMARY KEY AUTO_INCREMENT,
    id_aluno INT NOT NULL,
    id_turma INT NOT NULL,
    data_inscricao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDENTE','ATIVA','CANCELADA','CONCLUIDA')
        NOT NULL DEFAULT 'PENDENTE',
    UNIQUE (id_aluno, id_turma),
    FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno),
    FOREIGN KEY (id_turma) REFERENCES turmas(id_turma)
);

CREATE TABLE frequencias (
    id_frequencia INT PRIMARY KEY AUTO_INCREMENT,
    id_inscricao INT NOT NULL,
    data_aula DATE NOT NULL,
    presente BOOLEAN NOT NULL DEFAULT FALSE,
    observacao VARCHAR(255),
    registrado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_monitor INT,
    UNIQUE (id_inscricao, data_aula),
    FOREIGN KEY (id_inscricao) REFERENCES inscricoes(id_inscricao),
    FOREIGN KEY (id_monitor) REFERENCES monitor(id_monitor)
        ON DELETE SET NULL
);

CREATE TABLE checkins (
    id_checkin INT PRIMARY KEY AUTO_INCREMENT,
    id_frequencia INT NOT NULL,
    data_hora_original DATETIME NOT NULL,
    data_hora_sincronizacao DATETIME,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    sincronizado BOOLEAN NOT NULL DEFAULT FALSE,
    observacao VARCHAR(255),
    FOREIGN KEY (id_frequencia) REFERENCES frequencias(id_frequencia)
        ON DELETE CASCADE
);

CREATE TABLE parcerias (
    id_parceria INT PRIMARY KEY AUTO_INCREMENT,
    id_associacao INT NOT NULL,
    numero_processo VARCHAR(50),
    instrumento VARCHAR(100),
    data_inicio DATE NOT NULL,
    data_fim DATE,
    valor DECIMAL(12,2),
    status ENUM('PLANEJADA','VIGENTE','ENCERRADA','SUSPENSA','CANCELADA')
        NOT NULL DEFAULT 'PLANEJADA',
    observacoes TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_associacao) REFERENCES associacoes(id_associacao)
);

CREATE TABLE parceria_modalidades (
    id_parceria INT NOT NULL,
    id_modalidade INT NOT NULL,
    observacoes VARCHAR(255),
    PRIMARY KEY (id_parceria, id_modalidade),
    FOREIGN KEY (id_parceria) REFERENCES parcerias(id_parceria)
        ON DELETE CASCADE,
    FOREIGN KEY (id_modalidade) REFERENCES modalidades(id_modalidade)
);

CREATE TABLE associacao_profissionais (
    id_vinculo INT PRIMARY KEY AUTO_INCREMENT,
    id_associacao INT NOT NULL,
    id_usuario INT NOT NULL,
    funcao ENUM('PROFESSOR','MONITOR','COORDENADOR') NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_associacao) REFERENCES associacoes(id_associacao),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE carteirinhas (
    id_carteirinha INT PRIMARY KEY AUTO_INCREMENT,
    id_aluno INT NOT NULL UNIQUE,
    codigo_qr VARCHAR(255) NOT NULL UNIQUE,
    data_emissao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno)
        ON DELETE CASCADE
);

CREATE INDEX idx_aluno_nome ON aluno(nome);
CREATE INDEX idx_modalidade_ativo ON modalidades(ativo);
CREATE INDEX idx_turma_modalidade ON turmas(id_modalidade);
CREATE INDEX idx_turma_unidade ON turmas(id_unidade);
CREATE INDEX idx_inscricao_status ON inscricoes(status);
CREATE INDEX idx_frequencia_data ON frequencias(data_aula);
CREATE INDEX idx_parceria_status ON parcerias(status);


/*
Coisas pra fazer aqui depois

1. Revisar a normalização do banco: 1FN, 2FN, 3FN, FNBC, 4FN, 5FN e 6FN.
2. Corrigir relacionamentos duplicados entre profissionais e associações.
3. Cadastrar as 25 modalidades esportivas oficiais.
4. Cadastrar unidades, horários, turmas e associações parceiras.
5. Implementar os cadastros de alunos, monitores, coordenadores e secretaria.
6. Implementar login seguro com senhas criptografadas por hash.
7. Implementar confirmação do responsável para alunos menores de idade.
8. Desenvolver inscrições de alunos nas modalidades e turmas.
9. Criar carteirinhas digitais com QR Code.
10. Implementar controle de frequência e relatórios em PDF.
11. Implementar funcionamento offline e sincronização com o servidor.
12. Desenvolver permissões de acesso conforme o perfil do usuário.
13. Integrar o banco MySQL com PHP, APIs, HTML, CSS e JavaScript.
14. Testar o fluxo completo: cadastro -> inscrição -> frequência -> relatório.
15. Configurar backups e documentar o banco de dados.

*/
