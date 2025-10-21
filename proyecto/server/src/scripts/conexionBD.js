import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

class BD {
  //Atributo privado

  #pool;

  constructor() {
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

      console.log("Consulta obtenerTFGnoVistos ejecutada para usuario: " + usuario + "\n");
      console.log("TFGs no vistos obtenidos: " + rows.length + "\n");
    return rows;
  }
}

const bdInstance = new BD();

export default bdInstance;