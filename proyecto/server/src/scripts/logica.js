import bdInstance from "./conexionBD.js";

//MIDDLEWARES
export async function checkAuth(request, reply) {
    if (!request.session.user) {
      const acceptsJson = request.headers.accept?.includes('application/json');
      if (acceptsJson) {
        return reply.code(401).send({ error: 'No autorizado. Inicie sesión.' });
      } else {
        return reply.redirect('/login.html');
      }
    }
  }

// TRANSFORMAR HTMLs

export function TFGinHTML(rows, tipo) {
  let tfgsHtml = '';
  if (rows.length > 0) {
      tfgsHtml = rows.map(tfg => {
          const esProfesor = (tipo === 1);

          const deleteButtonHtml = esProfesor
              ? `<button 
                  class="delete-button" 
                  data-tfg="${tfg.nombre}"
                  onclick="window.location.href='/borrarTfg?nombre=' + encodeURIComponent(this.getAttribute('data-tfg'))">
                  Eliminar 🗑️
                </button>`
              : ''; 

          return `
          <div class="tfg-card">
              <h2>${tfg.nombre}</h2>
              <p>${tfg.descripcion}</p>
              <button class="like-button" data-tfg="${tfg.nombre}">Me gusta 👍</button>
              ${deleteButtonHtml} 
          </div>
          `;
      }).join('');
  } else {
      tfgsHtml = '<p>No hay nuevos TFGs para mostrar.</p>';
  }

  return tfgsHtml;
}