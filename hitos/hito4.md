## Estructura del Clúster

El despliegue consta de **5 contenedores** organizados en capas lógicas:

### 1. Capa de Aplicación (Backend)
* **Servicio:** `fastify-server`
* **Función:** API REST desarrollada en Node.js con Fastify.
* **Puerto Expuesto:** `3000` (HTTP).
* **Configuración:** Se utiliza *bind-mount* del código fuente (`./server/src`) para permitir desarrollo iterativo (*hot-reloading*).

### 2. Capa de Base de Datos
* **Servicio:** `mariadb_db`
* **Función:** Base de datos relacional principal.
* **Almacenamiento:** Volumen local mapeado (`./bd`) para garantizar que los datos sobrevivan al reinicio de contenedores.

### 3. Capa de Observabilidad
* **Prometheus (`prometheus_metrics`):** Recolector de métricas de series temporales.
* **Grafana (`grafana_dashboard`):** Visualización de métricas. Expuesto en puerto `3001` para evitar conflictos con el backend.
* **MySQL Exporter (`mysqld_exporter`):** Agente que extrae métricas de rendimiento de MariaDB y las expone en formato compatible con Prometheus.

---

### ¿Cómo se comunican?
La comunicación entre servicios se realiza mediante **resolución de nombres DNS internos**. No se utilizan direcciones IP en crudo; en su lugar, los servicios se referencian por su nombre de host definido en el orquestador (ej: `mariadb_db:3306`).

### ¿Qué se expone al exterior?
Solo se exponen al host los puertos estrictamente necesarios para la interacción del usuario y tareas de administración:
* **API:** Puerto `:3000`
* **Grafana:** Puerto `:3001`
* **Base de Datos:** Puerto `:3306` (acceso directo para herramientas de gestión SQL).

### ¿Por qué se han desplegado de esta forma?
1. **Eficiencia y Desacoplamiento:** La separación en capas permite escalar y mantener cada componente de forma independiente.
2. **Patrón Sidecar:** Respecto a la observabilidad, no se utiliza un único contenedor monolítico ni se instalan agentes dentro de la base de datos. Se optó por el **modelo Sidecar** (usando el `mysqld_exporter`), lo que evita contaminar los contenedores de `fastify` y `mariadb` con procesos ajenos a su función principal.

## ¿Porque se han usado esas imágenes concretas de los contenedores?

### 1. Servicio de Base de Datos
* **Imagen Base:** `mariadb:11`

**Justificación de la Imagen:** Se prefiere sobre MySQL por mantener una alta compatibilidad y ofrecer un rendimiento optimizado en consultas complejas. Usar una etiqueta de versión específica (`:11`) en lugar de `:latest` es una buena práctica para garantizar la inmutabilidad del entorno.

**Justificación de la Configuración:**

- **Persistencia (`volumes`):** Se mapeó `./bd:/var/lib/mysql` para desacoplar los datos del ciclo de vida del contenedor. Esto garantiza que si el contenedor se destruye o actualiza, la información del negocio no se pierde.
- **Variables de Entorno:** Se inyectan las credenciales y el nombre de la base de datos al inicio (`MYSQL_ROOT_PASSWORD`, etc.) para automatizar el provisioning inicial, evitando tener que entrar manualmente al contenedor a crear la base de datos.
- **Política de Reinicio (`restart: always`):** Garantiza la alta disponibilidad básica; si el proceso de la base de datos falla, Docker intentará levantarlo nuevamente de inmediato.

---

### 2. Servicio de Backend (`fastify-server`)
* **Imagen Base:** `node`

**Justificación de la Imagen:** Se emplea una variante `alpine` por su tamaño ligero (menos de 50MB), lo que acelera los tiempos de construcción y despliegue.

**Justificación de la Configuración:**

- **Entorno de Desarrollo (`volumes`):** La configuración `./server/src:/app/src` es una técnica de bind mounting estratégica para el desarrollo. Permite el Hot-Reloading inmediatamente en el contenedor sin necesidad de reconstruir la imagen.
- **Orquestación (`depends_on`):** Se declara la dependencia explícita de `mariadb` para asegurar que Docker intente iniciar la base de datos antes que el servidor, reduciendo errores de conexión en el arranque.
- **Networking:** Se inyecta la variable `DB_HOST: mariadb`. Esto justifica el uso del DNS interno de Docker: el backend no necesita saber la IP de la base de datos, solo su nombre de servicio.

---

### 3. Servicio de Visualización (`grafana`)
* **Imagen Base:** `grafana/grafana-oss:latest`

**Justificación de la Imagen:** Se eligió la versión OSS (Open Source Software) en lugar de la Enterprise para mantener el proyecto libre de licencias propietarias.

**Justificación de la Configuración:**

- **Mapeo de Puertos (`3001:3000`):** Esta es una decisión de arquitectura para evitar colisiones de puertos. Dado que tanto Fastify como Grafana escuchan por defecto en el puerto 3000, se reasignó el puerto externo de Grafana al 3001 para permitir que ambos servicios coexistan en el mismo host.
- **Persistencia (`grafana_data`):** Se utiliza un volumen nombrado para guardar dashboards, usuarios y configuraciones. Sin esto, cada reinicio del contenedor borraría los gráficos personalizados creados.

---

### 4. Servicio de Recolección de Métricas (`prometheus`)
* **Imagen Base:** `prom/prometheus:latest`

**Justificación de la Imagen:** Prometheus es el estándar de facto para monitoreo en arquitecturas de contenedores. Su imagen oficial es ligera y está optimizada para manejar grandes volúmenes de series temporales.

**Justificación de la Configuración:**

- **Inyección de Configuración (`volumes`):** Se inyecta el archivo `prometheus.yml` desde el host. Esto es fundamental porque permite modificar qué servicios se monitorean editando un archivo local, sin necesidad de crear una nueva imagen de Docker personalizada para Prometheus.

---

### 5. Exportador de Métricas SQL (`mysqld-exporter`)
* **Imagen Base:** `prom/mysqld-exporter:latest`

**Justificación de la Imagen:** Esta imagen implementa el Patrón Adaptador (Adapter Pattern). MariaDB no expone métricas en formato Prometheus nativamente. Esta imagen actúa como un traductor oficial y mantenido por la comunidad de Prometheus, garantizando fiabilidad en la extracción de datos.

**Justificación de la Configuración:**

- **Seguridad (`my.cnf`):** Se monta un archivo de configuración `.cnf`. Esto es una práctica de seguridad para ocultar credenciales
