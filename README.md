# Proyecto a desarrollar

## Resumen
El proyecto a desarrollar será el de una aplicación en la nube, que permitirá que los usuarios suban sus ideas 
para la realización de un TFG y los tipos de usuarios estudiante y profesor podrán indicar si les gusta la idea.

Cuando un profesor y un alumno coincidan se les notificará y podrán chatear para hablar sobre el tema.

Este proyecto se va desarrollar desde 0

## Tecnologías

- **Fastify**: Framework web para Node.js rápido y ligero.  
- **MariaDB**: Base de datos relacional.  
- **Yarn**: Gestor de dependencias.  
- **Docker**: Para contenerizar la aplicación y la base de datos. 

## Descripción de carpetas y archivos (dentro de la carpeta proyecto)

- **Dockerfile**: Contiene las instrucciones para crear la imagen Docker del proyecto.  
- **package.json / yarn.lock**: Dependencias y scripts del proyecto.  
- **server.js**: Archivo principal del servidor Fastify.  
- **public/index.html**: Archivo HTML que se servirá desde el servidor.  
- **db/init.sql**: Script SQL para inicializar la base de datos y crear tablas.
