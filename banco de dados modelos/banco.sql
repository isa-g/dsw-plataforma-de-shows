-- Geração de Modelo físico
-- Sql ANSI 2003 - brModelo.



CREATE TABLE Artista (
Id_art integer PRIMARY KEY,
nome_artista Varchar(50)
)

CREATE TABLE Local (
Id_local integer PRIMARY KEY,
nome_local Varchar(50),
cidade Varchar(50),
capacidade double,
Id_art integer,
FOREIGN KEY(Id_art) REFERENCES Artista (Id_art)
)

CREATE TABLE Show (
Id_show integer PRIMARY KEY,
data timestamp,
horario timestamp,
setores Varchar(100),
Id_art integer,
Id_local integer,
FOREIGN KEY(Id_art) REFERENCES Artista (Id_art),
FOREIGN KEY(Id_local) REFERENCES Local (Id_local)
)

CREATE TABLE Ingresso (
Id_show integer,
Id_usu integer,
FOREIGN KEY(Id_show) REFERENCES Show (Id_show)
)

CREATE TABLE Usuário (
Id_usu integer PRIMARY KEY,
nome Varchar(50),
nome único integer,
email Varchar(50),
senha_hash integer
)

ALTER TABLE Ingresso ADD FOREIGN KEY(Id_usu) REFERENCES Usuário (Id_usu)
