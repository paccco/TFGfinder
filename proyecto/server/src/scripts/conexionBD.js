/**
 * @file conexionBD.js
 * Este archivo define la clase 'BD', que encapsula toda la interacción
 * con la base de datos MySQL. Utiliza 'mysql2/promise' para crear un pool
 * de conexiones y ejecutar consultas asíncronas.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '/app/ini.env' });

/**
 * @class BD
 * Gestiona la conexión y las consultas a la base de datos.
 * Sigue el patrón Singleton al exportar una única instancia 'bdInstance'.
 */
class BD {
  /**
   * @private
   * @type {import('mysql2/promise').Pool | null}
   * El pool de conexiones a la base de datos.
   */
  #pool;

  /**
   * Crea una instancia de BD.
   * Inicializa el pool de conexiones usando variables de entorno.
   */
  constructor() {
    this.#pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT,
      connectionLimit: 10 // Limita a 10 conexiones simultáneas
    });
  }

  /**
   * Verifica las credenciales de un usuario contra la base de datos.
   * @param {string} nombre - El nombre de usuario.
   * @param {string} password - La contraseña (en texto plano).
   * @returns {Promise<number>} El 'tipo' de usuario (ej: 0 o 1) si las credenciales son correctas,
   * o -1 si el usuario no existe o la contraseña es incorrecta.
   */
  async iniciarSesion(nombre, password) {
    const [rows] = await this.#pool.execute(
      'SELECT * FROM Usuarios WHERE nombre = ? AND password = ?',
      [nombre, password]
    );

    if (rows.length > 0) {
      return rows[0].tipo; //Devuelve el tipo de usuario
    } else {
      return -1;//Error
    }
  }

  /**
   * Obtiene todos los TFGs a los que un usuario específico NO ha dado 'like'.
   * @param {string} usuario - El nombre del usuario.
   * @returns {Promise<Array<object>>} Un array de objetos TFG.
   */
  async getTFGnoVistos(usuario) {
    const [rows] = await this.#pool.execute(`
      SELECT *
      FROM TFG
      WHERE
        nombre NOT IN (
          SELECT tfg
          FROM TFG_Likes
          WHERE usuario = ?
        );
      `,
      [usuario]
    );

    return rows;
  }

  /**
   * Obtiene una lista "ligera" de los chats de un usuario (profesor o alumno).
   * @param {string} usuario - El nombre del usuario.
   * @returns {Promise<Array<object>>} Un array de objetos Chat (solo tfg, profesor, alumno).
   */
  async getChatsUsuarioLite(usuario) {
    const [rows] = await this.#pool.execute(`
      SELECT id, tfg, profesor, alumno
      FROM Chats
      WHERE profesor = ? OR alumno = ?;
    `, [usuario, usuario]);
    
    return rows;
  }

  /**
   * Obtiene la información básica de un chat específico por su ID.
   * @param {number|string} id - El identificador único del chat.
   * @returns {Promise<Array<object>>} Un array que contiene la información del chat (tfg, profesor, alumno).
   */
  async getChatInfo(id) {
    const [rows] = await this.#pool.execute(`
      SELECT tfg, profesor, alumno
      FROM Chats
      WHERE id = ?;
    `, [id]);
    
    return rows;
  }

  /**
   * Obtiene el historial completo de mensajes de un chat, ordenado cronológicamente.
   * @param {number|string} chatId - El identificador del chat.
   * @returns {Promise<Array<object>>} Un array de objetos de mensajes (id, autor, contenido, envío).
   */
  async getMensajesChat(chatId) {
    const [rows] = await this.#pool.execute(`
      SELECT id, chat_id, autor, contenido, envio
      FROM Mensajes
      WHERE chat_id = ?
      ORDER BY envio ASC;
    `, [chatId]);
    
    return rows;
  }

  /**
   * Inserta un nuevo usuario en la base de datos.
   * @param {string} nombre - El nombre de usuario (debe ser único).
   * @param {string} password - La contraseña.
   * @param {number} tipo - El tipo de usuario (ej: 0 o 1).
   * @returns {Promise<boolean>} True si la inserción fue exitosa (1 fila afectada).
   */
  async insertUsuario(nombre, password, tipo) {
    const [result] = await this.#pool.execute(
      'INSERT INTO Usuarios (nombre, password, tipo) VALUES (?, ?, ?)',
      [nombre, password, tipo]
    );

    return result.affectedRows === 1;
  }

  /**
   * Inserta un nuevo TFG en la base de datos.
   * @param {string} nombre - El nombre/título del TFG (debe ser único).
   * @param {string} descripcion - La descripción del TFG.
   * @returns {Promise<boolean>} True si la inserción fue exitosa.
   */
  async insertTFG(nombre, descripcion) {
    const [result] = await this.#pool.execute(
      'INSERT INTO TFG (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion]
    );

    console.log("Nuevo TFG subido: " + nombre + "\n");

    return result.affectedRows === 1;
  }

  /**
   * Inserta un 'like' de un usuario a un TFG.
   * Además, comprueba si este 'like' crea un "match" (alumno-profesor)
   * y, si es así, crea una nueva entrada en la tabla 'Chats'.
   * @param {string} user - El nombre del usuario que da 'like'.
   * @param {number} tipo - El tipo del usuario que da 'like'.
   * @param {string} tfg - El nombre del TFG que recibe el 'like'.
   * @returns {Promise<boolean>} True si el 'like' se insertó correctamente.
   */
  async insertLike(user ,tipo ,tfg) {
    // Inserta el like
    const [result] = await this.#pool.execute(
      'INSERT INTO TFG_Likes (usuario, tfg) VALUES (?, ?)',
      [user, tfg]
    );

    const resultadoInsert = result.affectedRows === 1;

    // Lógica de "Matchmaking" para crear chats
    if (tipo === 0 && resultadoInsert) { // El usuario es un ALUMNO
        
        // Buscamos profesores que hayan dado like al mismo TFG
        const [profesores] = await this.#pool.execute(
            `SELECT U.nombre FROM Usuarios U JOIN TFG_Likes L ON U.nombre = L.usuario 
            WHERE U.tipo = 1 AND L.tfg = ?`,
            [tfg]
        );
        
        // Si hay 'matches', crea un chat por cada uno
        if(profesores.length>0){
          for (const prof of profesores) {
            await this.#pool.execute(
                // 'INSERT IGNORE' evita errores si el chat ya existe (clave única)
                `INSERT IGNORE INTO Chats (tfg, profesor, alumno) VALUES (?, ?, ?)`,
                [tfg, prof.nombre, user]
            );
          }
        }

    } else if (tipo === 1 && resultadoInsert) { // El usuario es un PROFESOR
        
        // Buscamos alumnos que hayan dado like al mismo TFG
        const [alumnos] = await this.#pool.execute(
            `SELECT U.nombre FROM Usuarios U JOIN TFG_Likes L ON U.nombre = L.usuario 
            WHERE U.tipo = 0 AND L.tfg = ?`,
            [tfg]
        );

        // Si hay 'matches', crea un chat por cada uno
        if(alumnos.length>0){
          for (const alu of alumnos) {
            await this.#pool.execute(
                `INSERT IGNORE INTO Chats (tfg, profesor, alumno) VALUES (?, ?, ?)`,
                [tfg, user, alu.nombre]
            );
          }
        }
      }
      
      // Devuelve si el LIKE original se insertó
      return resultadoInsert;
  }

  async insertMensaje(chatId, autor, contenido) {
    const [result] = await this.#pool.execute(
      'INSERT INTO Mensajes (chat_id, autor, contenido) VALUES (?, ?, ?)',
      [chatId, autor, contenido]
    );

    return result.affectedRows === 1;
  }

  /**
   * Elimina un TFG de la base de datos.
   * (Gracias a 'ON DELETE CASCADE', esto también borrará los Likes y Chats asociados).
   * @param {string} nombre - El nombre del TFG a eliminar.
   * @returns {Promise<boolean>} True si la eliminación fue exitosa.
   */
  async delTFG(nombre) {
    const [result] = await this.#pool.execute(
      'DELETE FROM TFG WHERE nombre = ?',
      [nombre]
    );

    console.log("TFG eliminado: " + nombre + "\n");

    return result.affectedRows === 1;
  }


  // --- Funciones de Prueba / Depuración ---

  /**
   * (Solo Pruebas) Obtiene todos los TFGs a los que un usuario ha dado 'like'.
   * @param {string} usuario - El nombre del usuario.
   * @returns {Promise<Array<object>>} Un array de objetos (solo con 'tfg').
   */
  async getLikesUsuario(usuario) {
    const [rows] = await this.#pool.execute(`
      SELECT tfg
      FROM TFG_Likes
      WHERE usuario = ?;
    `, [usuario]);

    return rows;
  }

  /**
   * (Solo Pruebas) Obtiene el nombre de todos los TFGs en el sistema.
   * @returns {Promise<Array<object>>} Un array de objetos (solo con 'nombre').
   */
  async getTodoslosTFG() {
    const [rows] = await this.#pool.execute(`
      SELECT nombre FROM TFG;
    `);
  
      console.log(rows.length + " TFGs obtenidos.\n");

    return rows;
  }

  /**
   * Cierra el pool de conexiones.
   * Útil para un apagado limpio del servidor.
   */
  async closePool() {
    if (this.#pool) {
      await this.#pool.end();
      console.log("Pool de conexiones cerrado.");
    }
  }
}

// Se exporta una única instancia de la clase (Patrón Singleton)
const bdInstance = new BD();

export default bdInstance;