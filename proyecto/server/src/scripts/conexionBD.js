import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

if(!process.env.CI){
  dotenv.config({ path: '/app/ini.env' });
}

class BD {
  //Atributo privado

  #pool;

  constructor() {

    console.log('[DEBUG CI] Verificando variables de entorno...');
console.log('[DEBUG CI] DB_HOST:', process.env.DB_HOST);
console.log('[DEBUG CI] DB_PORT:', process.env.DB_PORT);
console.log('[DEBUG CI] DB_USER:', process.env.DB_USER);
console.log('[DEBUG CI] DB_PASSWORD (longitud):', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'no definida');
console.log('[DEBUG CI] DB_DATABASE:', process.env.DB_DATABASE); // <-- Esta es la línea clave
console.log('--- FIN DE LOGS DE DEPURACIÓN ---');

    this.#pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      connectionLimit: 10
    });
  }

  async inciarSesion(nombre, password) {
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

  async obtenerTFGnoVistos(usuario) {
    const [rows] = await this.#pool.execute(`
      SELECT *
      FROM TFG
      WHERE
        nombre NOT IN (
          SELECT tfg
          FROM TFG_Likes
          WHERE usuario = '${usuario}'
        );
      `);
    return rows;
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