## Configuracion de yarn para el proyecto

Para la instalación de yarn, se necesita la última versión estable de npm, una vez actualizado se ejecutará en la línea de comandos:

```bash
npm install -g yarn
```
Una vez instalado yarn se procede a ejecutar el siguiente comando para preparar el proyecto para su uso:

```bash
yarn init -y
```
Seguiendo con la isntalación de dependencias necesarias para las tecnologías del proyecto, en la parte del servidor:

```bash
yarn add fastify fastify-static
yarn add --dev jest
```
Dependencias para la parte de la bd:

```bash
yarn add mariadb
```

En el package.json es necesario añadir scripts para inciar el server y poder usar jest:

```js
"scripts": {
  "start": "node server.js",
  "test": "jest"
}
```
