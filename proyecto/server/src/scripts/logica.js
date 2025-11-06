import { readFileSync } from 'fs';
import { join } from 'path';

import bdInstance from './conexionBD.js';

export async function checkAuth(request, reply) {
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

export function TFGinHTML(rows) {
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

    return tfgsHtml;
}