CREATE TABLE Setor (
    id_setor SERIAL PRIMARY KEY,
    nome_setor VARCHAR(100) NOT NULL,
    is_coberto BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE Vaga (
    id_vaga SERIAL PRIMARY KEY,
    id_setor INT NOT NULL REFERENCES Setor(id_setor) ON DELETE CASCADE,
    codigo_vaga VARCHAR(50) NOT NULL,
    tipo_vaga VARCHAR(50) NOT NULL -- 'Normal', 'PCD', 'Idoso', 'Moto'
);

CREATE TABLE Veiculo (
    id_veiculo SERIAL PRIMARY KEY,
    placa VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE Registro_Estacionamento (
    id_registro SERIAL PRIMARY KEY,
    id_veiculo INT NOT NULL REFERENCES Veiculo(id_veiculo) ON DELETE RESTRICT,
    id_vaga INT NOT NULL REFERENCES Vaga(id_vaga) ON DELETE RESTRICT,
    data_hora_entrada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_hora_saida TIMESTAMP DEFAULT NULL,
    valor_pago DECIMAL(10, 2) DEFAULT NULL
);
