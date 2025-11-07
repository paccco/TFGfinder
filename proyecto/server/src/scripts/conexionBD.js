import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '/app/ini.env' });

class BD {
  //Atributo privado

  #pool;

  constructor() {
    this.#pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT,
      connectionLimit: 10
    });
  }

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

  async getChatsUsuarioLite(usuario) {
    const [rows] = await this.#pool.execute(`
      SELECT tfg,profesor,alumno
      FROM Chats
      WHERE profesor = ? OR alumno = ?;
    `, [usuario, usuario]);
    
    return rows;
  }

  async insertUsuario(nombre, password, tipo) {
    const [result] = await this.#pool.execute(
      'INSERT INTO Usuarios (nombre, password, tipo) VALUES (?, ?, ?)',
      [nombre, password, tipo]
    );

    return result.affectedRows === 1;
  }

  async insertTFG(nombre, descripcion) {
    const [result] = await this.#pool.execute(
      'INSERT INTO TFG (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion]
    );

    console.log("Nuevo TFG subido: " + nombre + "\n");

    return result.affectedRows === 1;
  }

  async insertLike(user ,tipo ,tfg) {
    const [result] = await this.#pool.execute(
      'INSERT INTO TFG_Likes (usuario, tfg) VALUES (?, ?)',
      [user, tfg]
    );

    const resultadoInsert = result.affectedRows === 1;

    if (tipo === 0 && resultadoInsert) { // El usuario es un ALUMNO
        
        // Buscamos profesores que hayan dado like
        const [profesores] = await this.#pool.execute(
            `SELECT U.nombre FROM Usuarios U JOIN TFG_Likes L ON U.nombre = L.usuario 
            WHERE U.tipo = 1 AND L.tfg = ?`,
            [tfg]
        );
        
        if(profesores.length>0){
          for (const prof of profesores) {
            await this.#pool.execute(
                `INSERT IGNORE INTO Chats (tfg, profesor, alumno) VALUES (?, ?, ?)`,
                [tfg, prof.nombre, user]
            );
          }
        }

    } else if (tipo === 1 && resultadoInsert) { // El usuario es un PROFESOR
        
        // Buscamos alumnos que hayan dado like
        const [alumnos] = await this.#pool.execute(
            `SELECT U.nombre FROM Usuarios U JOIN TFG_Likes L ON U.nombre = L.usuario 
            WHERE U.tipo = 0 AND L.tfg = ?`,
            [tfg]
        );

        // Creamos un chat por cada alumno encontrado
        if(alumnos.length>0){
          for (const alu of alumnos) {
            await this.#pool.execute(
                `INSERT IGNORE INTO Chats (tfg, profesor, alumno) VALUES (?, ?, ?)`,
                [tfg, user, alu.nombre]
            );
          }
        }
      }

      return resultadoInsert;
  }

  async delTFG(nombre) {
    const [result] = await this.#pool.execute(
      'DELETE FROM TFG WHERE nombre = ?',
      [nombre]
    );

    console.log("TFG eliminado: " + nombre + "\n");

    return result.affectedRows === 1;
  }


  //Esto solo es para pruebas
  async getLikesUsuario(usuario) {
    const [rows] = await this.#pool.execute(`
      SELECT tfg
      FROM TFG_Likes
      WHERE usuario = ?;
    `, [usuario]);

    return rows;
  }

  async getTodoslosTFG() {
    const [rows] = await this.#pool.execute(`
      SELECT nombre FROM TFG;
    `);
  
      console.log(rows.length + " TFGs obtenidos.\n");

    return rows;
  }

  async closePool() {
    if (this.#pool) {
      await this.#pool.end();
      console.log("Pool de conexiones cerrado.");
    }
  }
}

const bdInstance = new BD();

export default bdInstance;