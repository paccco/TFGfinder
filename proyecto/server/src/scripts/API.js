/**
 * @file API.js
 * Archivo principal de la API de Fastify.
 * Define las rutas , el middleware de autenticación y
 * las funciones de ayuda para renderizar HTML dinámico.
 */

// Importaciones de módulos
import dotenv from 'dotenv';
dotenv.config({ path: '/app/ini.env' });

import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

// Ruta al directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

// Importación de la capa de lógica de negocio
import logica from './logica.js';

// --- CARGA DE PLANTILLAS HTML ---
// Se leen del disco una sola vez al iniciar el servidor para mejorar el rendimiento.
const plantillaPantallaPrin = readFileSync(
  join(__dirname, '../view/pantallaPrin.html'), 
  'utf8'
);
const plantillaChats = readFileSync(
  join(__dirname, '../view/pantallaPrin/chats.html'), 
  'utf8'
);

// --- MIDDLEWARE ---

/**
 * Middleware de autenticación (hook 'onRequest').
 * Verifica si un usuario ha iniciado sesión antes de permitir el acceso a una ruta.
 * @param {object} request - Objeto de la petición de Fastify
 * @param {object} reply - Objeto de la respuesta de Fastify
 */
async function checkAuth(request, reply) {
  // Comprueba si la información del usuario existe en la sesión
  if (!request.session.user) {
    // Si no hay sesión, comprueba si la petición espera JSON (API) o HTML (Navegador)
    const acceptsJson = request.headers.accept?.includes('application/json');
    if (acceptsJson) {
      // Si es una API, devuelve un error 401
      return reply.code(401).send({ error: 'No autorizado. Inicie sesión.' });
    } else {
      // Si es un navegador, redirige a la página de login
      return reply.redirect('/login.html');
    }
  }
  // Si la sesión existe, la petición continúa
}

// --- FUNCIONES DE AYUDA PARA RENDERIZAR VISTAS (HTML) ---

/**
 * Genera el HTML para una lista de tarjetas de TFG.
 * @param {Array} rows - Un array de objetos TFG desde la base de datos.
 * @param {number} tipo - El tipo de usuario (0 = alumno, 1 = profesor).
 * @returns {string} Un string de HTML con las tarjetas.
 */
function TFGinHTML(rows, tipo) {
  let tfgsHtml = '';
  if (rows.length > 0) {
      tfgsHtml = rows.map(tfg => {
          const esProfesor = (tipo === 1);

          // Añade condicionalmente el botón de eliminar si el usuario es profesor
          const deleteButtonHtml = esProfesor
              ? `<button 
                  class="delete-button"
                  onclick="window.location.href='/borrarTfg?nombre=' + encodeURIComponent('${tfg.nombre}')">
                  Eliminar 🗑️
                </button>`
              : ''; 

          // Plantilla de la tarjeta de TFG
          return `
          <div class="tfg-card">
              <h2>${tfg.nombre}</h2>
              <p>${tfg.descripcion}</p>
              <button 
                class="like-button"
                onclick="window.location.href='/likeTFG?nombre=' + encodeURIComponent('${tfg.nombre}')">
                Me gusta 👍
              </button>
              ${deleteButtonHtml} 
          </div>
          `;
      }).join('');
  } else {
      tfgsHtml = '<p>No hay nuevos TFGs para mostrar.</p>';
  }

  return tfgsHtml;
}

/**
 * Genera el HTML completo de la página principal dinámicamente.
 * @param {string} user - Nombre del usuario.
 * @param {number} userTipo - Tipo del usuario.
 * @returns {Promise<string>} El string del HTML final.
 */
async function generarPantallaPrincipal(user, userTipo) {
  // 1. Obtiene los TFGs que el usuario aún no ha visto
  const rows = await logica.tfgsNoVistos(user);
  // 2. Genera el HTML de las tarjetas
  const tfgsHtml = TFGinHTML(rows, userTipo);
  // 3. Inserta el HTML generado en la plantilla principal
  const finalHtml = plantillaPantallaPrin.replace(
    '<div id="tfg-container-placeholder"></div>', 
    tfgsHtml 
  );

  return finalHtml;
}

/**
 * Genera el HTML para la lista de tarjetas de chat.
 * @param {Array} rows - Un array de objetos Chat desde la base de datos.
 * @param {string} user - El nombre del usuario de la sesión.
 * @returns {string} Un string de HTML con las tarjetas de chat.
 */
function ChatsEnHTML(rows, user) {
  
  if (!rows || rows.length === 0) {
      return '<p style="text-align: center; color: #555;">No tienes chats activos.</p>';
  }

  return rows.map(chat => {
      
      // Determina quién es la "otra persona" en el chat
      const otraPersonaNombre = (chat.profesor === user)
          ? chat.alumno
          : chat.profesor;
      
      // Genera un avatar con las iniciales
      const avatar = generarIniciales(otraPersonaNombre);

      // Plantilla de la tarjeta de chat
      return `
      <a href="/chat/${chat.id}" class="chat-item-card">
          <div class="chat-avatar">${avatar}</div>
          <div class="chat-content">
              <h2 class="chat-name">${otraPersonaNombre}</h2>
              <p class=".chat-tfg-title">${chat.tfg}</p>
          </div>
      </a>
      `;
  }).join(''); 
}

/**
 * Función de utilidad para generar iniciales para los avatares.
 * @param {string} nombre - El nombre completo.
 * @returns {string} Las iniciales (ej: "AL").
 */
function generarIniciales(nombre) {
  if (!nombre) return '?';
  const partes = nombre.trim().split(' ');
  
  if (partes.length > 1) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  
  if (partes[0].length > 1) {
      return (partes[0][0] + partes[0][1]).toUpperCase();
  }

  return partes[0][0].toUpperCase();
}

/**
 * @typedef {import('fastify').FastifyInstance} FastifyInstance
 * @typedef {import('fastify').FastifyPluginOptions} FastifyPluginOptions
 */

/**
 * Plugin principal de Fastify que registra todas las rutas de la aplicación.
 * @param {FastifyInstance} fastify - La instancia de Fastify.
 * @param {FastifyPluginOptions} options - Opciones del plugin.
 */
export default async function (fastify, options) {
    
  /**
   * @route POST /crearUsuario
   * Ruta pública para registrar un nuevo usuario (profesor o estudiante).
   * Espera datos JSON en el body.
   */
  fastify.post('/crearUsuario',
    {
      // Validación de la entrada (body)
      schema: {
        body: {
          type: 'object',
          required: ['user', 'password', 'tipo'],
          properties: {
            user: { type: 'string' },
            password: { type: 'string' },
            tipo: { type: 'integer', enum: [0, 1] } // 0: estudiante, 1: profesor
          }
        }
      }
    }
    ,async (req, reply) => {
    
      const { user, password, tipo } = req.body;

      try {
        const exito = await logica.crearUsuario(user, password, tipo);

        if (exito) {
          reply.redirect('/login.html'); // Éxito, redirige al login
        } else {
          reply.code(500).send({ error: 'Error al crear el usuario' });
        }
      }
      catch (error) {
        // Manejo de error específico para "Usuario duplicado"
        if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
          return reply.code(409).send({ error: 'El nombre de usuario ya existe' });
        }

        console.error(error);
        reply.code(500).send({ error: 'Error interno del servidor' });
      }
    }
  );

  /**
   * @route POST /login/verifica
   * Ruta pública para autenticar un usuario.
   * Si tiene éxito, crea una sesión y devuelve un JSON.
   */
  fastify.post('/login/verifica',
    {
      // Validación de entrada
      schema: {
        body: {
          type: 'object',
          required: ['user', 'password'],
          properties: {
            user: { type: 'string' },
            password: { type: 'string' }
          }
        }
      }
    }
    , async (req, reply) => {
    
    const { user, password } = req.body;

    try {
      const resultado = await logica.iniciarSesion(user, password);

      if (resultado !== -1) {
        // Guarda los datos del usuario en la cookie de sesión
        req.session.user = {
          nombre: user,
          tipo: resultado
        };

        return { message: 'Sesión iniciada correctamente' };
      } else {
        // Si las credenciales son incorrectas, devuelve 401
        reply.code(401).send({ error: 'Credenciales incorrectas' });
      }

    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: 'Error interno del servidor' });
    }
  });

  /**
   * @route GET /logout
   * Destruye la sesión del usuario y lo redirige al inicio.
   */
  fastify.get('/logout', async (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error("Error al cerrar sesión:", err);
        return res.code(500).send("Error interno del servidor");
      }
      res.redirect('/index.html');
    });
  });
  
  // --- SERVIR PÁGINAS HTML ---
  
  /**
   * @route GET /login.html
   * Sirve la página de login.
   * Si el usuario ya tiene una sesión, le sirve la página principal.
   */
  fastify.get('/login.html', async (req, res) => {
    if(req.session.user){
      // Si ya está logueado, genera y sirve la pantalla principal
      const html =await generarPantallaPrincipal(req.session.user.nombre,req.session.user.tipo);
      res.type('text/html').send(html);
    }else{
      // Sirve la página de login estática
      const html = readFileSync(join(__dirname, '../view/login.html'), 'utf8');
      res.type('text/html').send(html);
    }
  });

  // --- RUTAS PROTEGIDAS (Requieren autenticación) ---

  /**
   * @route GET /pantallaPrin.html
   * Ruta protegida que sirve la página principal.
   * El hook 'checkAuth' asegura que el usuario esté logueado.
   */
  fastify.get( '/pantallaPrin.html',
      {
        onRequest: [checkAuth], // Middleware de autenticación
        onSend: async (req, res) => {
          // Evita que el navegador guarde en caché esta página (seguridad)
          res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
          res.header('Pragma', 'no-cache');
          res.header('Expires', '0');
        }
      }, 
      async (req, res) => {
        try {
          // Genera el HTML dinámicamente con los datos del usuario
          const finalHtml = await generarPantallaPrincipal(req.session.user.nombre, req.session.user.tipo);
          res.type('text/html').send(finalHtml);
        } catch (error) {
          console.error("Error al cargar pantallaPrin:", error);
          res.code(500).send("Error interno del servidor");
        }
      }
  );

  /**
   * @route GET /pantallaPrin/subirTfg.html
   * Ruta protegida que sirve la página estática para subir un TFG.
   */
  fastify.get('/pantallaPrin/subirTfg.html', 
    {
      onRequest: [checkAuth] 
    },
    async (req, res) => {
      try {
        const html = readFileSync(join(__dirname, '../view/pantallaPrin/subirTfg.html'), 'utf8');
        res.type('text/html').send(html);
      } catch (error) {
        console.error("Error al cargar subirTfg:", error);
        res.code(500).send("Error interno del servidor");
      }
    }
  );

  /**
   * @route GET /pantallaPrin/chats.html
   * Ruta protegida que sirve la página de chats del usuario.
   */
  fastify.get('/pantallaPrin/chats.html', 
    {
        onRequest: [checkAuth]
    },
    async (req, res) => {
      try {
          const userNombre = req.session.user.nombre;
          // 1. Obtiene los chats del usuario
          const chats = await logica.chatsUsuarioLite(userNombre);
          // 2. Genera el HTML para la lista de chats
          const chatsHtml = ChatsEnHTML(chats, userNombre);
          // 3. Inserta el HTML en la plantilla de chats
          const finalHtml = plantillaChats.replace(
            '<!-- Aquí se podrían cargar dinámicamente más chats -->',
            chatsHtml 
          );
          res.type('text/html').send(finalHtml);

      } catch (error) {
          console.error("Error al cargar la página de chats:", error);
          res.code(500).send("Error interno del servidor");
      }
    }
  );

  /**
   * @route POST /subirTfg
   * Ruta protegida (API) para que un usuario suba un nuevo TFG.
   */
  fastify.post( '/subirTfg',
    {
      onRequest: [checkAuth],
      onSend: async (req, res) => {
        res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');
      }
    }, 
    async (req, res) => {
      // Recibe los datos del TFG desde el body (JSON)
      const {nombre, descripcion} = req.body;

      try {
        await logica.subirTFG(nombre, descripcion);
        res.send({ message: 'TFG subido correctamente' });
      } catch (error) {
        console.error("Error al subir TFG:", error);
        res.code(500).send("Error interno del servidor");
      }
    }
  );

  /**
   * @route GET /likeTFG
   * Ruta protegida (API) para que un usuario dé 'like' a un TFG.
   * Recibe el nombre del TFG como un query parameter.
   */
  fastify.get( '/likeTFG',
    {
      onRequest: [checkAuth]
    }, 
    async (req, res) => {
      // Recibe el nombre del TFG desde la URL (ej: /likeTFG?nombre=MiTFG)
      const { nombre } = req.query;
      const userNombre = req.session.user.nombre;
      const tipo = req.session.user.tipo;

      // Validación: asegura que el parámetro 'nombre' fue enviado
      if (!nombre) {
        return res.code(400).send("Error: Falta el parámetro 'nombre' del TFG.");
      }

      try {
        if(await logica.likeTFG(userNombre, tipo, nombre)){
          // Éxito: recarga la página principal
          res.redirect('/pantallaPrin.html');
        }else{
          res.code(500).send("Error al registrar like");
        }
      } catch (error) {
        console.error("Error al registrar like:", error);
        res.code(500).send("Error interno del servidor");
      }
    }
  );

  /**
   * @route GET /borrarTfg
   * Ruta protegida (API) para eliminar un TFG.
   * Solo los profesores (tipo 1) pueden ejecutar esta acción.
   */
  fastify.get('/borrarTfg', 
    { onRequest: [checkAuth] }
    , async (req, res) => {
    // Recibe el nombre del TFG desde la URL (query parameter)
    const tfgNombre = req.query.nombre;
    try {
      // Comprobación de autorización (además de autenticación)
      if(req.session.user.tipo === 1){ // 1 = Profesor
        if(await logica.borrarTFG(tfgNombre)){
          res.redirect('/pantallaPrin.html');
        }else{
          res.code(500).send("Error al eliminar TFG");
        }
      }else{
        // Si el usuario no es profesor, devuelve 403 Prohibido
        res.code(403).send("No autorizado");
      }
    } catch (error) {
      console.error("Error al eliminar TFG:", error);
      res.code(500).send("Error interno del servidor");
    }
  }
  );
}