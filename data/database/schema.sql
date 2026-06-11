CREATE SCHEMA IF NOT EXISTS saude_maix;
SET search_path TO saude_maix, public;


CREATE TABLE IF NOT EXISTS Responsavel (
    id_responsavel SERIAL PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    grau_parentesco VARCHAR(50) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100)
);


CREATE TABLE IF NOT EXISTS Paciente (
    id_paciente SERIAL PRIMARY KEY,
    id_responsavel INT REFERENCES Responsavel(id_responsavel) NOT NULL,
    nome_completo VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    data_nascimento DATE NOT NULL,
    sexo_biologico CHAR(1) CHECK (sexo_biologico IN ('M', 'F')) NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20)
);


CREATE TABLE IF NOT EXISTS Profissional (
    id_profissional SERIAL PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    especialidade VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(100),
    num_conselho VARCHAR(50) UNIQUE,
    login VARCHAR(50) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) CHECK (perfil IN ('Administrador', 'Padrão')) NOT NULL
);


CREATE TABLE IF NOT EXISTS Indicador_Clinico (
    id_indicador SERIAL PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    peso_masculino DECIMAL(4,2) NOT NULL,
    peso_feminino DECIMAL(4,2) NOT NULL
);


CREATE TABLE IF NOT EXISTS Triagem (
    id_triagem SERIAL PRIMARY KEY,
    id_paciente INT REFERENCES Paciente(id_paciente) NOT NULL,
    id_profissional INT REFERENCES Profissional(id_profissional) NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS Indicador_Triagem (
    id_triagem INT REFERENCES Triagem(id_triagem) ON DELETE CASCADE,
    id_indicador INT REFERENCES Indicador_Clinico(id_indicador),
    presente BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id_triagem, id_indicador)
);


CREATE TABLE IF NOT EXISTS Relatorio (
    id_relatorio SERIAL PRIMARY KEY,
    id_triagem INT REFERENCES Triagem(id_triagem) NOT NULL,
    percentual DECIMAL(5,2),
    score_final DECIMAL(5,2) NOT NULL,
    alertas VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS Prontuario (
    id_prontuario SERIAL PRIMARY KEY,
    id_paciente INT REFERENCES Paciente(id_paciente) NOT NULL,
    id_relatorio INT REFERENCES Relatorio(id_relatorio) NOT NULL,
    conduta_adotada TEXT NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


TRUNCATE TABLE Indicador_Clinico RESTART IDENTITY CASCADE;

INSERT INTO Indicador_Clinico (categoria, descricao, peso_masculino, peso_feminino) VALUES
('Cognitivo', 'Deficiência Intelectual', 0.32, 0.20),
('Físico', 'Face alongada/orelhas', 0.29, 0.09),
('Físico', 'Macroorquidismo', 0.26, 0.00),
('Físico', 'Hipermobilidade articular', 0.19, 0.04),
('Cognitivo', 'Dificuldades de aprendizagem', 0.18, 0.28),
('Comportamental', 'Déficit de atenção', 0.17, 0.12),
('Comportamental', 'Movimentos repetitivos', 0.17, 0.05),
('Comportamental', 'Atraso na fala', 0.14, 0.01),
('Comportamental', 'Hiperatividade', 0.12, 0.04),
('Comportamental', 'Evita contato visual', 0.06, 0.08),
('Comportamental', 'Evita contato físico', 0.04, 0.07),
('Comportamental', 'Agressividade', 0.01, 0.02);

SET search_path TO saude_maix, public;


TRUNCATE TABLE Prontuario RESTART IDENTITY CASCADE;
TRUNCATE TABLE Relatorio RESTART IDENTITY CASCADE;
TRUNCATE TABLE Indicador_Triagem RESTART IDENTITY CASCADE;
TRUNCATE TABLE Triagem RESTART IDENTITY CASCADE;
TRUNCATE TABLE Profissional RESTART IDENTITY CASCADE;
TRUNCATE TABLE Paciente RESTART IDENTITY CASCADE;
TRUNCATE TABLE Responsavel RESTART IDENTITY CASCADE;

COPY Responsavel FROM 'C:/Temp/responsavel.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');
COPY Paciente FROM 'C:/Temp/paciente.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');
COPY Profissional FROM 'C:/Temp/profissional.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');
COPY Triagem FROM 'C:/Temp/triagem.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');
COPY Indicador_Triagem FROM 'C:/Temp/indicador_triagem.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');
COPY Relatorio FROM 'C:/Temp/relatorio.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');
COPY Prontuario FROM 'C:/Temp/prontuario.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');

