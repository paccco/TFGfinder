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
