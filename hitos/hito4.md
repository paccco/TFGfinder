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

# 🐳 Documentación del Dockerfile (Microservicio Backend)

El archivo `Dockerfile`, ubicado en `./server/Dockerfile`, define el entorno de ejecución para la API REST (`fastify-server`).

A continuación, se detalla y justifica cada instrucción utilizada:

---

### 1. Selección de la Imagen Base

```dockerfile
FROM node:lts-alpine
```

> **Justificación Técnica:**
> * **Versión LTS (Long Term Support):** Se utiliza la versión de soporte a largo plazo de Node.js.
> * **Distribución Alpine Linux:** Se opta por la variante `alpine` en lugar de distribuciones completas como Debian o Ubuntu. Alpine es extremadamente ligera (**aprox. 5MB base** + Node), lo que reduce drásticamente la superficie de ataque y agiliza la transferencia de contenedores por la red.

---

### 2. Definición del Directorio de Trabajo

```dockerfile
WORKDIR /app
```

> **Justificación Técnica:**
> * **Aislamiento:** Establece `/app` como el directorio raíz dentro del contenedor. Esto aísla los archivos de la aplicación de la raíz del sistema operativo, facilitando la organización y evitando conflictos accidentales con archivos del sistema Linux.

---

### 3. Gestión de Dependencias y Estrategia de Caché

Esta sección es crítica para la eficiencia del ciclo de desarrollo (CI/CD).

```dockerfile
COPY package*.json ./
RUN npm install
```

> **Justificación Técnica (Layer Caching):**
> * **Copia Selectiva:** Se copian exclusivamente los archivos de definición (`package.json` y `package-lock.json`) *antes* de copiar el código fuente.
> * **Beneficio:** Docker construye imágenes por capas. Al separar la instalación, Docker puede **cachear** la capa resultante de `npm install`.
> * **Resultado:** Si modificas el código fuente (`.js`) pero no añades nuevas librerías, Docker reutilizará la carpeta `node_modules` ya construida, reduciendo el tiempo de *re-build* de varios minutos a **pocos segundos**.

---

### 4. Incorporación del Código Fuente

```dockerfile
COPY . .
```

> **Justificación Técnica:**
> * **Integración:** Una vez que las dependencias están instaladas y la capa anterior asegurada en caché, se copia la totalidad del código fuente del proyecto al directorio de trabajo del contenedor.

---

### 5. Exposición y Comando de Arranque

```dockerfile
EXPOSE 3000
CMD ["npm", "run", "start"]
```

> **Justificación Técnica:**
> * **EXPOSE 3000:** Documenta explícitamente que el contenedor escuchará peticiones en el puerto `3000`. Sirve como documentación viva y referencia para configurar el `docker-compose.yml`.
> * **CMD:** Define el comando de ejecución por defecto. Se utiliza el script `start` definido en el `package.json` para iniciar el servidor Fastify en modo producción.

## Subida automática del contenedor
### Flujo de Trabajo: Docker Publish

El pipeline se ejecuta secuencialmente realizando las siguientes operaciones críticas:

* **1. Preparación del Entorno (Checkout)**
  > Descarga tu código fuente en la máquina virtual para poder trabajar con él.

* **2. Sanitización de Variables**
  > Ejecuta un comando rápido para corregir el nombre del repositorio (`Paccco` -> `paccco`), ya que Docker prohíbe las mayúsculas.

* **3. Autenticación (Login)**
  > Se conecta a **GitHub Packages** (`ghcr.io`) usando credenciales automáticas para obtener permisos de escritura.

* **4. Despliegue (Build & Push)**
  > Crea la imagen Docker usando los archivos de la carpeta `./proyecto/server` y la sube inmediatamente a tu registro.

![Foto imagen](https://github.com/paccco/TFGfinder/blob/main/imagenes/hito4/imagenCreada.png)

## Orquestación de Servicios
**Archivo:** `docker-compose.yaml`

Define la infraestructura completa de la aplicación, integrando el backend, base de datos y el stack de monitorización en una red unificada.

| Servicio | Contenedor | Puerto Ext. | Descripción | Persistencia/Config |
| :--- | :--- | :--- | :--- | :--- |
| **mariadb** | `mariadb_db` | **3306** | Base de datos principal. | `./bd` (Datos persistentes) |
| **fastify** | `fastify_server` | **3000** | API Backend (Node.js) + Métricas. | `./server` (Hot-reload) |
| **grafana** | `grafana_dashboard`| **3001** | Visualización (Dashboards). | `grafana_data` (Volumen) |
| **prometheus** | `prometheus_metrics`| **9090** | Agregador de métricas. | `./prometheus.yml` (Config) |
| **exporter** | `mysqld_exporter` | **9104** | Adaptador de métricas SQL. | `./my.cnf` (Credenciales) |
