# Configuracion del proyecto

En esta sección se comentará la creación de los contenedores:
```yaml
version: "3.9"

services:
  mariadb:
    image: mariadb:11
    container_name: mariadb_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: mydatabase
      MYSQL_USER: user
      MYSQL_PASSWORD: userpassword
    ports:
      - "3306:3306"
    volumes:
      - ./bd:/var/lib/mysql

  fastify-server:
    build: ./server 
    container_name: fastify_server
    restart: always
    ports:
      - "3000:3000"
    environment:
      PORT: 3000
      HOST: 0.0.0.0
      DB_HOST: mariadb
      DB_USER: user
      DB_PASSWORD: userpassword
      DB_NAME: mydatabase
    volumes:
      - ./server/src:/app/src
      - /app/node_modules
    depends_on:
      - mariadb
```
Este archivo docker-compose.yml configura un entorno de dos contenedores: un servicio mariadb que ejecuta una base de datos MariaDB 11 (llamada mydatabase) persistiendo sus datos en la carpeta local ./bd, y un servicio fastify-server que se construye desde la carpeta ./server. El servidor Fastify se expone en el puerto 3000, se conecta a la base de datos usando el nombre mariadb como host, y sincroniza el código fuente de ./server/src para permitir el desarrollo en vivo, asegurando además que la base de datos se inicie siempre primero.

## Contenedor: Base de datos

Instalamos el contenedor oficial de mariaDB, ya que este contenedor solo va a atender peticiones. 
IMPORTANTE el docker-compose.yaml lo subo para que se vean los detalles de como se ha creado la BD, obviamente se han cambiado las contraseñas y usuarios para evitar problemas de seguridad

## Contenedor: Server

Una vez instalado yarn usando
```bash
npm install -g yarn
```

Una vez instalado, en la carpeta server se ejecuta:
```bash
yarn init -y
```

Se procede a añadir las dependencias, dotoenv sirve para leer el .env
```bash
yarn add fastify dotoenv
yarn add --dev jest
```

## Levantando ambos contenedores

Ahora tocaria configurar el docker-compose.yaml, basicamente lo que se debe lograr es levantar 2 contenedores, 1 para la BD y otro para el server que recibirá y servirá peticiones al usuario. Se debe de hacer en el mismo archivo ya que este explica de que forma se conectan varios contenedores. Una vez configurado ejecutamos en la terminal:

```bash
sudo docker-compose up -d --build
```

Ya estarían ambos contenedores en ejecución. Muy importante añadir todos los archivos a ignorar en el gitIgnore, entre ellos los .env, logs, archivos temporales, etc. Ahora mismo como no hay tablas de la BD no hay contenido pero más adelante será necesario hacer un dump para obtener el esquema por si alguien quiere reconstruir una BD con la misma lógica.

## Configuración del gestor de tareas

Para empezar hay que instalar, yarn se planea usar este gestor porque es mucho más rápido y eficiente que node (Facebook desarrollo yarn con ese objetivo). Como primer paso se ejecutará:

```bash
npm install -g yarn
```

El siguiente paso sería usar en la carpeta del servidor (-y es para aceptar todas las opciones):

```bash
yarn init -y
```

Después se procede a instalar las dependencias(en la misma carpeta del servidor):

```bash
yarn add <dependencias>
```

Y por último deberemos añadir al dockerfile lo siguiente:
```Dockerfile
# Dockerfile para la aplicación Node.js
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de dependencias e instalar
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto y definir el comando de inicio
EXPOSE 3000
CMD ["yarn", "start"]
```

## Configurando la biblioteca de aserciones
¿Porque se usará jest? Porque usa un lenguaje muy natural y da unos logs muy claros, aquí un ejemplo:
```diff
- Expected
+ Received

  {
    "id": 123,
-   "user": "admin",
+   "user": "guest",
    "status": "active"
  }
```

Para proceder a su instalación primero se debe ejecutar:
```bash
yarn add jest
```
Con este comando se añadirá jest a la línea del package.json:
```json
"scripts": { 
    "start": "node --watch src/scripts/index.js"
    "test": "jest"
  }
```
También se debe de haber creado el archivo jest.config.js, indicamos que vamos a ejecutar jest en un entorno node:
```json
module.exports = {
    testEnvironment: 'node',
  };
```

Antes de modificar el package.json para su correcta realización de pruebas deberemos crear un test para ejecutar, en este caso se creó el tfgsVisibles.test.js(MUY IMPORTANTE esta nomenclatura .test.js sino no lo detecta) que sirve para probar si un usuario no ve en la pantalla principal tfgs que ya ha indicado que le gustan. Una vez creado el archivo se añade al package.json:
```json
"scripts": { 
    "start": "node --watch src/scripts/index.js",
    "test": "jest --runInBand src/tests/",
    "test:tfgs": "jest src/tests/tfgsVisibles.test.js"
  }
```
De esta forma al ejecutar ```yarn test:tfgs``` se ejecutaría dicho test dando el siguiente output si toda la funcionalidad está correcta:
```bash
/app # yarn test:tfgs
yarn run v1.22.22
warning package.json: No license field
$ jest src/tests/tfgsVisibles.test.js
..........
 PASS  src/tests/tfgsVisibles.test.js
  Pruebas de TFGs visibles para un usuario en la página principal
    ✓ Los TFGs no vistos deben ser correctos según los 'Me gusta' del usuario (12 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.219 s
Ran all test suites matching src/tests/tfgsVisibles.test.js.
Done in 2.10s.
```

## Configuración IC
Se ha decidido usar git actions, dado que es una herramienta cuyo uso está muy extendido, para ello debemos crear el directorio .github en el mismmo en el que se situa .git, dentro se creará la carpeta workflows en la cuál debemos crear un archivo yaml en el que definiremos la configuración del contenedor que construiran en los servidores de git.

```yaml
name: CI de Node.js y MariaDB

# 1. Disparadores: Cuándo se ejecuta esta acción
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  # 2. Definimos un "job" o trabajo llamado "test"
  test:
    name: Ejecutar Pruebas (Jest)
    runs-on: ubuntu-latest # Usar una máquina virtual de Ubuntu

    # GitHub Actions levantará este contenedor (MariaDB)
    # y lo conectará a la red del runner principal.
    services:
      mariadb:
        image: mariadb:10.6 # Usa la versión que necesites
        ports:
          - 3306:3306 # Mapea el puerto
        env:
          # Define las variables de entorno para la BBDD de prueba
          MYSQL_ROOT_PASSWORD: rootpassword
          MYSQL_DATABASE: mydatabase
          MYSQL_USE_NATIVE_AIO: 0
        # Opción de Healthcheck: No empezar las pruebas hasta que la BBDD esté lista
        options: >-
          --health-cmd="mysqladmin ping -h localhost -u root -proot"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      # Paso 1: Obtener tu código del repositorio
      - name: Checkout del código
        uses: actions/checkout@v4

      # Paso 2: Configurar Node.js
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20' 
          cache: 'yarn' # Activa la caché para Yarn
          cache-dependency-path: proyecto/server/yarn.lock

      # Paso 3: Instalar dependencias con Yarn
      - name: Instalar dependencias
        run: yarn install --frozen-lockfile
        working-directory: ./proyecto/server

      # Paso 4: Cargar el dump de la base de datos de prueba
      - name: Cargar el dump de la base de datos de prueba
        run: 
          mysql -h 127.0.0.1 --port 3306 -u root -prootpassword mydatabase < dump_pruebas.sql
        working-directory: ./proyecto

      # Paso 5: Ejecutar las pruebas (Jest)
      - name: Correr Jest
        run: yarn test
        working-directory: ./proyecto/server
        # Pasa las variables de entorno a tu app (Fastify/Jest)
        # para que sepa cómo conectarse al servicio MariaDB
        env:
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_USER: root
          DB_PASSWORD: rootpassword
          DB_DATABASE: mydatabase
          CI: true
```

Y ya tendríamos git actions funcionando
![Foto workflow](https://github.com/paccco/TFGfinder/blob/main/imagenes/hito2/workflow.png)
