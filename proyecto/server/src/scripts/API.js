import dotenv from 'dotenv';
dotenv.config({ path: '/app/ini.env' });

import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

const __filename = fileURLToPath(import.meta.url); // Ruta al archivo actual (index.js)
const __dirname = path.dirname(__filename)

import logica from './logica.js';

//PLANTILLAS HTML
const plantillaPantallaPrin = readFileSync(
  join(__dirname, '../view/pantallaPrin.html'), 
  'utf8'
);
const plantillaChats = readFileSync(
  join(__dirname, '../view/pantallaPrin/chats.html'), 
  'utf8'
);

//MIDDLEWARE
async function checkAuth(request, reply) {
  if (!request.session.user) {
    const acceptsJson = request.headers.accept?.includes('application/json');
    if (acceptsJson) {
      return reply.code(401).send({ error: 'No autorizado. Inicie sesión.' });
    } else {
      return reply.redirect('/login.html');
    }
  }
}

function TFGinHTML(rows, tipo) {
  let tfgsHtml = '';
  if (rows.length > 0) {
      tfgsHtml = rows.map(tfg => {
          const esProfesor = (tipo === 1);

          console.log("\n Generando tarjeta TFG para: " + tfg.nombre + ", esProfesor: " + esProfesor+ "\n");

          const deleteButtonHtml = esProfesor
              ? `<button 
                  class="delete-button"
                  onclick="window.location.href='/borrarTfg?nombre=' + encodeURIComponent('${tfg.nombre}')">
                  Eliminar 🗑️
                </button>`
              : ''; 

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

async function generarPantallaPrincipal(usuarioNombre, usuarioTipo) {
  const rows = await logica.tfgsNoVistos(usuarioNombre);
  const tfgsHtml = TFGinHTML(rows, usuarioTipo);
  const finalHtml = plantillaPantallaPrin.replace(
    '<div id="tfg-container-placeholder"></div>', 
    tfgsHtml 
  );

  return finalHtml;
}

function ChatsEnHTML(rows, usuarioActual) {
  
  if (!rows || rows.length === 0) {
      return '<p style="text-align: center; color: #555;">No tienes chats activos.</p>';
  }

  return rows.map(chat => {
      
      const otraPersonaNombre = (chat.profesor === usuarioActual)
          ? chat.alumno   // Si yo soy el profesor, muestra al alumno
          : chat.profesor;  // Si yo soy el alumno, muestra al profesor
      
      const avatar = generarIniciales(otraPersonaNombre);

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

function generarIniciales(nombre) {
  if (!nombre) return '?';
  const partes = nombre.trim().split(' ');
  
  // Si tiene nombre y apellido (ej: "Ana López")
  if (partes.length > 1) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  
  // Si es una sola palabra (ej: "Juan")
  if (partes[0].length > 1) {
      return (partes[0][0] + partes[0][1]).toUpperCase();
  }

  // Si es una sola letra (raro, pero por si acaso)
  return partes[0][0].toUpperCase();
}

export default async function (fastify, options) {
    
  fastify.post('/crearUsuario',
    {
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
          reply.redirect('/login.html');
        } else {
          reply.code(500).send({ error: 'Error al crear el usuario' });
        }
      }
      catch (error) {

        if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
          return reply.code(409).send({ error: 'El nombre de usuario ya existe' });
        }

        console.error(error);
        reply.code(500).send({ error: 'Error interno del servidor' });
      }
    }
  );

  fastify.post('/login/verifica',
    {
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
        req.session.user = {
          nombre: user,
          tipo: resultado
        };

        return { message: 'Sesión iniciada correctamente' };
      } else {
        reply.code(401).send({ error: 'Credenciales incorrectas' });
      }

    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: 'Error interno del servidor' });
    }
  });

  fastify.get('/logout', async (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error("Error al cerrar sesión:", err);
        return res.code(500).send("Error interno del servidor");
      }
      res.redirect('/index.html');
    });
  });
  
  //Servir páginas HTML
  
  fastify.get('/login.html', async (req, res) => {
    if(req.session.user){
      const html =await generarPantallaPrincipal(req.session.user.nombre,req.session.user.tipo);
      res.type('text/html').send(html);
    }else{
      const html = readFileSync(join(__dirname, '../view/login.html'), 'utf8');
      res.type('text/html').send(html);
    }
  });

  //PROTEGIDAS

  fastify.get( '/pantallaPrin.html',
      {
        onRequest: [checkAuth],
        onSend: async (req, res) => {//Para evitar cachear páginas con datos sensibles
          res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
          res.header('Pragma', 'no-cache');
          res.header('Expires', '0');
        }
      }, 
      async (req, res) => {
        try {
          const finalHtml = await generarPantallaPrincipal(req.session.user.nombre, req.session.user.tipo);
          res.type('text/html').send(finalHtml);
        } catch (error) {
          console.error("Error al cargar pantallaPrin:", error);
          res.code(500).send("Error interno del servidor");
        }
      }
  );

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

  fastify.get('/pantallaPrin/chats.html', 
    {
        onRequest: [checkAuth]
    },
    async (req, res) => {
      try {
          const usuarioNombre = req.session.user.nombre;
          const chats = await logica.chatsUsuarioLite(usuarioNombre);
          const chatsHtml = ChatsEnHTML(chats, usuarioNombre);

          const finalHtml = plantillaChats.replace(
            '<!-- Aquí se podrían cargar dinámicamente más chats -->', // El placeholder
            chatsHtml 
          );
          res.type('text/html').send(finalHtml);

      } catch (error) {
          console.error("Error al cargar la página de chats:", error);
          res.code(500).send("Error interno del servidor");
      }
    }
  );

  fastify.post( '/subirTfg',
    {
      onRequest: [checkAuth],
      onSend: async (req, res) => {//Para evitar cachear páginas con datos sensibles
        res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');
      }
    }, 
    async (req, res) => {
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

  fastify.get( '/likeTFG',
    {
      onRequest: [checkAuth]
    }, 
    async (req, res) => {
      const { nombre } = req.query;
      const usuarioNombre = req.session.user.nombre;
      const tipo = req.session.user.tipo;

      if (!nombre) {
        return res.code(400).send("Error: Falta el parámetro 'nombre' del TFG.");
      }

      try {
        if(await logica.likeTFG(usuarioNombre, tipo, nombre)){
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

  fastify.get('/borrarTfg', 
    { onRequest: [checkAuth] }
    , async (req, res) => {
    const tfgNombre = req.query.nombre;
    try {
      if(req.session.user.tipo===1){
        if(await logica.borrarTFG(tfgNombre)){
          res.redirect('/pantallaPrin.html');
        }else{
          res.code(500).send("Error al eliminar TFG");
        }
      }else{
        res.code(403).send("No autorizado");
      }
    } catch (error) {
      console.error("Error al eliminar TFG:", error);
      res.code(500).send("Error interno del servidor");
    }
  }
  );
}