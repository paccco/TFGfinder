## Estructura cluster

Existen 5 contendores que se separan por capas:

  1. Aplicación (Backend):
       Servicio: fastify-server
       Función: API REST desarrollada en Node.js con Fastify.
       Puerto Expuesto: 3000 (HTTP)
       Configuración: Se utiliza bind-mount del código fuente (./server/src) para permitir desarrollo iterativo (hot-reloading).

  2. Base de Datos:
       Servicio: mariadb_db
       Función: Base de datos relacional principal.
       Almacenamiento: Volumen local mapeado (./bd) para garantizar que los datos sobrevivan al reinicio de contenedores.

3. Observavilidad:
      Prometheus (prometheus_metrics): Recolector de métricas de series temporales.
      Grafana (grafana_dashboard): Visualización de métricas. Expuesto en puerto 3001 para evitar conflictos con el backend.
      MySQL Exporter (mysqld_exporter): Agente que extrae métricas de rendimiento de MariaDB y las expone en formato compatible con Prometheus.

### ¿Como se comunican?

La comunicación entre servicios se realiza mediante resolución de nombres DNS internos, es decir, no se usan direcciones en crudo en su lugar se menciona a maria_db:3306. 

### ¿Que se expone al exterior?

Solo se exponen los puertos necesarios para la interacción del usuario y administración, API(:3000), Grafana(:3001) y acceso a la directo BD para herramientas de gestión SQL (:3306)

### ¿Porque se han desplegado de esta forma?

Entre las razones está la separación de los servicios en las capas ya mencionadas previamente para mayor eficiencia.
Otra razón que explica la siguiente pregunta "¿Porque no se levanta un solo docker que haga todas las tareas de observavilidad?" pues para ser fieles al modelo sidecar y evitar la implementación de agentes en los contenedores de fastify y mariadb.
