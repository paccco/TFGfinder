## ¿Que framework se usará para la API y por qué?

Se usará Fastify, dado que nos dá una serie de características que lo hacen muy bueno, las cuales son:

1. Rendimiento alto
Es uno de los más veloces. Tiene muy poca sobrecarga y usa serialización de JSON súper optimizada.

3. Basado en Schemas
Te recomienda definir la estructura de tus peticiones usando JSON Schema.

Validación Automática: Rechaza peticiones incorrectas (errores 400) automáticamente, antes de que lleguen a tu código.

Serialización Rápida: Usa los schemas para optimizar la creación de respuestas JSON.

Documentación Automática: Genera Swagger/OpenAPI gratis a partir de tus schemas.

3. Arquitectura de Plugins Moderna
Todo se añade como un plugin (CORS, cookies, sesiones). A diferencia de Express, los plugins están encapsulados: solo afectan a las rutas que se declaran después de ellos. Esto evita el desorden global y hace el código más limpio y fácil de mantener.

## Diseño de la API

La API esta diseñada en 3 archivos:
  - API.js: es la parte que se encarga de procesar las peticiones y servir/construir los htmls
  - logica.js: es donde se almacena la lógica de negocio ahora mismo solo funciona como passthrough, es decir, llama a la BD directamente, pero si fuera necesario hacer algun preprocesamiento sería de gran utilidad, además de que permite que el código sea más testeable
  - conexionBD.js: se encarga de manejar el pool de la BD, para evitar saturacion de peticiones se configura en el env el número máximo de conexiones permitidas en una instancia del pool y se usa el patrón singleton para evitar que se contruyan más instancias.

## Rutas

Rutas POST (API):

  - /crearUsuario
  - /login/verifica
  - /subirTfg

Rutas GET (Páginas y Acciones):

  - /logout
  - /login.html
  - /pantallaPrin.html
  - /pantallaPrin/subirTfg.html
  - /pantallaPrin/chats.html
  - /likeTFG
  - /borrarTfg

¿Porque he puesto /likeTFG y /borrarTfg en GET? Para que se actualize la pagina con los cambios

## Logs

Para el archivo de los logs se usará el logger por defecto de fastify. Para el cout se usará pine-pretty, que no es un logger como tal es un estilo de logger para que sean más visuales los logs y menos engorrosos de leer.

Se instala pine-pretty añadiendolo al package.json en dependecies y usando yarn install en el docker. Una vez isntalado se hacen los siguientes cambios en la parte donde se declara la funcion del server:

``` js
const app = Fastify({
  logger: {
    level: 'info', // Nivel mínimo de log
    // Configuración de "Transportes" (a dónde van los logs)
    transport: {
      targets: [
        // --- Target 1: La Consola (stdout) ---
        {
          target: 'pino-pretty', // Usa el formateador bonito
          options: {
            destination: 1, // '1' significa stdout (la consola)
            colorize: true, // Añade colores
            translateTime: 'HH:MM:ss Z', // Formato de hora simple
            ignore: 'pid,hostname' // No mostrar el ID de proceso y el host
          }
        },
        
        // --- Target 2: El Archivo ---
        {
          target: 'pino/file', // El transporte de archivo nativo de pino
          options: {
            // El archivo de log (en formato JSON, ideal para máquinas)
            destination: path.join(__dirname,'../log', 'fastify-logs.log'),
            mkdir: true // Crea la carpeta 'logs' si no existe
          }
        }
      ]
    }
  }
});
```

Una vez hecho esto se vuelve a cosntruir el docker y nos quedaría tal que así:
