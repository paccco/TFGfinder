import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import bdInstance from './conexionBD.js';

import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

const __filename = fileURLToPath(import.meta.url); // Ruta al archivo actual (index.js)
const __dirname = path.dirname(__filename)

async function checkAuth(request, reply) {
    if (!request.session.user) {
      const acceptsJson = request.headers.accept?.includes('application/json');
      if (acceptsJson) {
        return reply.code(401).send({ error: 'No autorizado. Inicie sesión.' });
      } else {
        return reply.redirect('/login');
      }
    }else{
        console.log("\nUsuario autenticado: " + request.session.user.nombre + "\n");
    }
  }

export default async function (fastify, options) {
    
    fastify.post('/login/verifica', async (request, reply) => {
      
      const { user, password } = request.body;

      try {
        const resultado = await bdInstance.inciarSesion(user, password);

        if (resultado !== -1) {
          request.session.user = {
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

    fastify.get('/', (req, res) => {
      const html = readFileSync(join(__dirname, '../view/index.html'), 'utf8');
      res.type('text/html').send(html);
    });
    
    fastify.get('/login', (req, res) => {
      if(!req.session.user){
        const html = readFileSync(join(__dirname, '../view/login.html'), 'utf8');
        res.type('text/html').send(html);
      }else{
        const html = readFileSync(join(__dirname, '../view/pantallaPrin.html'), 'utf8');
        res.type('text/html').send(html);
      }
    });
    
    fastify.get('/singIn', (req, res) => {
      const html = readFileSync(join(__dirname, '../view/singIn.html'), 'utf8');
      res.type('text/html').send(html);
    });
    
    //PROTEGIDAS

    fastify.get( '/pantallaPrin', 
        {
          onRequest: [checkAuth] 
        }, 
        async (req, res) => {
          
          try {
            const usuarioNombre = req.session.user.nombre;
    
            const rows = await bdInstance.obtenerTFGnoVistos(usuarioNombre);

            let tfgsHtml = '';
            if (rows.length > 0) {
              // Usamos map() para convertir cada 'row' en un string HTML
              tfgsHtml = rows.map(tfg => `
                <div class="tfg-card">
                  <h2>${tfg.nombre}</h2>
                  <p>${tfg.descripcion}</p>
                  <button class="like-button" data-tfg="${tfg.nombre}">Me gusta 👍</button>
                </div>
              `).join('');
            } else {
              tfgsHtml = '<p>No hay nuevos TFGs para mostrar.</p>';
            }
    
            const htmlTemplate = readFileSync(join(__dirname, '../view/pantallaPrin.html'), 'utf8');
            
            const finalHtml = htmlTemplate.replace(
              '<div id="tfg-container-placeholder"></div>', // Lo que buscamos
              tfgsHtml // Con lo que lo reemplazamos
            );
    
            res.type('text/html').send(finalHtml);
            
          } catch (error) {
            console.error("Error al cargar pantallaPrin:", error);
            res.code(500).send("Error interno del servidor");
          }
        }
      );
  }