import bdInstance from "./conexionBD.js";


class Logica{
  // ------- OPERACIONES EN LA BD --------------------

  // SELECTS

  async iniciarSesion(nombre, password) {
    return await bdInstance.iniciarSesion(nombre, password);
  }

  async chatsUsuarioLite(usuario) {
    return await bdInstance.getChatsUsuarioLite(usuario);
  }

  async tfgsNoVistos(usuario) {
    return await bdInstance.getTFGnoVistos(usuario);
  }

  // INSERTS

  async crearUsuario(nombre, password, tipo) {
    return await bdInstance.insertUsuario(nombre, password, tipo);
  }

  async subirTFG(nombre, descripcion) {
    return await bdInstance.insertTFG(nombre, descripcion);
  }

  async likeTFG(usuario, tipo, tfg) {
    return await bdInstance.insertLike(usuario, tipo, tfg);
  }

  // DELETES
  
  async borrarTFG(nombre) {
    return await bdInstance.delTFG(nombre);
  }

}

export default new Logica();