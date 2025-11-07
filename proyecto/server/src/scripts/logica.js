/**
 * @file logica.js
 * Este archivo define la clase 'Logica', que actúa como la capa de servicio
 * o lógica de negocio de la aplicación.
 *
 * Sirve como un intermediario entre la API (controlador) y la capa de
 * acceso a datos (conexionBD). Su propósito es encapsular las operaciones
 * de negocio, aunque en esta versión actúa principalmente como un
 * "passthrough" (pase directo) a la base de datos.
 */

import bdInstance from "./conexionBD.js";

/**
 * @class Logica
 * Encapsula todas las operaciones de negocio.
 * Sigue el patrón Singleton al exportar una única instancia.
 */
class Logica{
  
  // ------- OPERACIONES EN LA BD --------------------
  // Estas funciones llaman directamente a sus equivalentes
  // en la capa de base de datos (bdInstance).
  // -------------------------------------------------

  // --- SELECTS ---

  /**
   * Intenta iniciar sesión con un nombre y contraseña.
   * @param {string} nombre - El nombre de usuario.
   * @param {string} password - La contraseña.
   * @returns {Promise<number>} El tipo de usuario (0 o 1) o -1 si falla.
   */
  async iniciarSesion(nombre, password) {
    return await bdInstance.iniciarSesion(nombre, password);
  }

  /**
   * Obtiene la lista de chats (simplificada) para un usuario.
   * @param {string} usuario - El nombre del usuario.
   * @returns {Promise<Array<object>>} Array de objetos de chat.
   */
  async chatsUsuarioLite(usuario) {
    return await bdInstance.getChatsUsuarioLite(usuario);
  }

  /**
   * Obtiene los TFGs que un usuario NO ha visto (no les ha dado like).
   * @param {string} usuario - El nombre del usuario.
   * @returns {Promise<Array<object>>} Array de objetos TFG.
   */
  async tfgsNoVistos(usuario) {
    return await bdInstance.getTFGnoVistos(usuario);
  }

  // --- INSERTS ---

  /**
   * Registra un nuevo usuario en el sistema.
   * @param {string} nombre - El nombre de usuario.
   * @param {string} password - La contraseña.
   * @param {number} tipo - El tipo de usuario (0 o 1).
   * @returns {Promise<boolean>} True si la inserción fue exitosa.
   */
  async crearUsuario(nombre, password, tipo) {
    return await bdInstance.insertUsuario(nombre, password, tipo);
  }

  /**
   * Registra un nuevo TFG en el sistema.
   * @param {string} nombre - El nombre/título del TFG.
   * @param {string} descripcion - La descripción.
   * @returns {Promise<boolean>} True si la inserción fue exitosa.
   */
  async subirTFG(nombre, descripcion) {
    return await bdInstance.insertTFG(nombre, descripcion);
  }

  /**
   * Registra un 'like' de un usuario a un TFG y maneja la lógica de 'match'.
   * @param {string} usuario - El nombre del usuario.
   * @param {number} tipo - El tipo del usuario.
   * @param {string} tfg - El nombre del TFG.
   * @returns {Promise<boolean>} True si el like fue exitoso.
   */
  async likeTFG(usuario, tipo, tfg) {
    return await bdInstance.insertLike(usuario, tipo, tfg);
  }

  // --- DELETES ---
  
  /**
   * Elimina un TFG del sistema.
   * @param {string} nombre - El nombre del TFG a eliminar.
   * @returns {Promise<boolean>} True si la eliminación fue exitosa.
   */
  async borrarTFG(nombre) {
    return await bdInstance.delTFG(nombre);
  }

}

// Se exporta una única instancia de la clase (Patrón Singleton)
export default new Logica();