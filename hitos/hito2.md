# Configuracion del proeycto

Primero sera necesaria la instalación de yarn, se necesita la última versión estable de npm, una vez actualizado se ejecutará en la línea de comandos:

```bash
npm install -g yarn
```

Luego habrá que hacer unas instalaciones en la carpetas server y BD

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

Se procede a añadir las dependencias, nodemon nos ayudará al no tener que reiniciar el server por cada cambio y dotoenv sirve para leer el .env
```bash
yarn add fastify dotoenv
yarn add --dev jest nodemon
```

## Levantando ambos contenedores

Ahora tocaria configurar el docker-compose.yaml, basicamente lo que se debe lograr es levantar 2 contenedores, 1 para la BD y otro para el server que recibirá y servirá peticiones al usuario. Se debe de hacer en el mismo archivo ya que este explica de que forma se conectan varios contenedores.
Muy importante añadir todos los archivos a ignorar en el gitIgnore, entre ellos los .env, logs, archivos temporales, etc. Ahora mismo como no hay tablas de la BD no hay contenido pero más adelante será necesario hacer un dump para obtener el esquema por si alguien quiere reconstruir una BD con la misma lógica.

