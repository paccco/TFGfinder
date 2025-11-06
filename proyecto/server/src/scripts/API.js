import dotenv from 'dotenv';
dotenv.config({ path: '/app/ini.env' });

import bdInstance from './conexionBD.js';

import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

const __filename = fileURLToPath(import.meta.url); // Ruta al archivo actual (index.js)
const __dirname = path.dirname(__filename)

import { TFGinHTML, checkAuth } from './logica.js';

const plantillaPantallaPrin = readFileSync(
  join(__dirname, '../view/pantallaPrin.html'), 
  'utf8'
);

async function generarPantallaPrincipal(usuarioNombre) {

  const rows = await bdInstance.obtenerTFGnoVistos(usuarioNombre);

  const tfgsHtml = TFGinHTML(rows);

  const finalHtml = plantillaPantallaPrin.replace(
    '<div id="tfg-container-placeholder"></div>', 
    tfgsHtml 
  );

  return finalHtml;
}

export default async function (fastify, options) {
    
    fastify.get('/logout', async (req, res) => {
      req.session.destroy(err => {
        if (err) {
          console.error("Error al cerrar sesión:", err);
          return res.code(500).send("Error interno del servidor");
        }
        res.redirect('/index.html');
      });
    });

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
        const resultado = await bdInstance.inciarSesion(user, password);

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
  
    //Servir páginas HTML
    
    fastify.get('/login.html', async (req, res) => {
      if(req.session.user){
        const html =await generarPantallaPrincipal(req.session.user.nombre);
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
            const usuarioNombre = req.session.user.nombre;
            const finalHtml = await generarPantallaPrincipal(usuarioNombre);
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
            const html = readFileSync(join(__dirname, '../view/subirTfg.html'), 'utf8');
            res.type('text/html').send(html);
          } catch (error) {
            console.error("Error al cargar subirTfg:", error);
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
            await bdInstance.subirNuevoTFG(nombre, descripcion);
            res.send({ message: 'TFG subido correctamente' });
          } catch (error) {
            console.error("Error al subir TFG:", error);
            res.code(500).send("Error interno del servidor");
          }
        }
      );
  }