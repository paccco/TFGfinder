USE mydatabase;

CREATE TABLE TFG(
	nombre VARCHAR(50) PRIMARY KEY,
	descripcion VARCHAR(100)
);

CREATE TABLE Usuarios(
  nombre VARCHAR(50) PRIMARY KEY,
  password VARCHAR(20) NOT NULL,
  tipo BOOL NOT NULL,
  referencia VARCHAR(50),
  
  CONSTRAINT fk_usuario_referencia
        FOREIGN KEY (referencia)
        REFERENCES TFG(nombre)
        ON DELETE SET NULL
);

CREATE TABLE TFG_Likes (
    usuario VARCHAR(50) NOT NULL,
    tfg VARCHAR(50) NOT NULL,

    -- Restricción de Clave Foránea (FK) para el usuario
    CONSTRAINT fk_like_usuario
        FOREIGN KEY (usuario) REFERENCES Usuarios(nombre)
        ON DELETE CASCADE, -- Si se borra el usuario, se borra el like

    -- Restricción de Clave Foránea (FK) para el TFG
    CONSTRAINT fk_like_tfg
        FOREIGN KEY (tfg) REFERENCES TFG(nombre)
        ON DELETE CASCADE, -- Si se borra el TFG, se borra el like

    PRIMARY KEY (usuario, tfg)
);

CREATE TABLE Chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    tfg VARCHAR(50),
    profesor VARCHAR(50),
    alumno VARCHAR(50),

    -- Claves Foráneas
    FOREIGN KEY (tfg) REFERENCES TFG(nombre),
    FOREIGN KEY (profesor) REFERENCES Usuarios(nombre),
    FOREIGN KEY (alumno) REFERENCES Usuarios(nombre),

    -- Evita chats duplicados
    UNIQUE KEY (tfg, profesor, alumno)
);

CREATE TABLE Mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    chat_id INT NOT NULL,
    
    autor VARCHAR(50),
    
    contenido TEXT NOT NULL,
    
    envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

    FOREIGN KEY (chat_id) REFERENCES Chats(id) ON DELETE CASCADE,
    FOREIGN KEY (autor) REFERENCES Usuarios(nombre)
);

-- Usuarios

INSERT INTO Usuarios (nombre, password, tipo, referencia) 
VALUES ('prof_ana', 'pass_prof_123', 1, NULL);

INSERT INTO Usuarios (nombre, password, tipo, referencia) 
VALUES ('alu_pepe', 'pass_alu_456', 0, NULL);

INSERT INTO Usuarios (nombre, password, tipo, referencia) 
VALUES ('alu_laura', 'pass_alu_789', 0, NULL);


-- Algunos tfg

INSERT INTO TFG (nombre, descripcion) 
VALUES ('Proyecto IA', 'Investigación sobre redes neuronales convolucionales.');

INSERT INTO TFG (nombre, descripcion) 
VALUES ('Proyecto Web', 'Desarrollo de una app PWA con Fastify y Svelte.');

-- likes

INSERT INTO TFG_Likes (usuario, tfg) 
VALUES ('alu_pepe', 'Proyecto IA');

INSERT INTO TFG_Likes (usuario, tfg) 
VALUES ('alu_pepe', 'Proyecto Web');

INSERT INTO TFG_Likes (usuario, tfg) 
VALUES ('alu_laura', 'Proyecto IA');

INSERT INTO TFG_Likes (usuario, tfg) 
VALUES ('prof_ana', 'Proyecto IA');

-- Crear chat

INSERT INTO Chats (tfg, profesor, alumno) 
VALUES ('Proyecto IA', 'prof_ana', 'alu_pepe');

INSERT INTO Chats (tfg, profesor, alumno) 
VALUES ('Proyecto IA', 'prof_ana', 'alu_laura');

-- Mensajes

-- Mensaje 1 (del profesor)
INSERT INTO Mensajes (chat_id, autor, contenido) 
VALUES (1, 'prof_ana', 'Hola Pepe, he visto tu interés en el Proyecto IA. ¿Te gustaría que habláramos?');

-- Mensaje 2 (del alumno)
INSERT INTO Mensajes (chat_id, autor, contenido) 
VALUES (1, 'alu_pepe', '¡Hola! Sí, por supuesto. Me interesa mucho. ¿Cuándo le vendría bien?');

-- Mensaje 3 (del profesor)
INSERT INTO Mensajes (chat_id, autor, contenido) 
VALUES (1, 'prof_ana', 'Mañana a las 10:00 en mi despacho.');