# 📑 Criterios de Selección y Justificación de Despliegue

---

## 🎯 Pilares de Selección

Para determinar la plataforma ideal para desplegar nuestra aplicación en contenedores, se han priorizado los siguientes cuatro pilares:

1.  **💰 Sostenibilidad Económica:** Uso de modelos que proporcionen coste cero mediante créditos académicos (GitHub Student Pack).
2.  **🏗️ Abstracción y Gestión (PaaS vs IaaS):** Se prioriza un **PaaS (Platform as a Service)** para centrarse en el código y el contenedor, delegando la gestión de infraestructura al proveedor.
3.  **📈 Eficiencia y Escalado:** Optimización de recursos para garantizar que los créditos cubran todo el periodo lectivo.
4.  **🔄 Integración CI/CD:** Capacidad de conectar el repositorio de GitHub y automatizar el despliegue del contenedor de forma nativa.

---

## 🔍 Evaluación de Opciones

| Opción | Modelo | Evaluación Técnica | Decisión |
| :--- | :--- | :--- | :--- |
| **Oracle Cloud** | IaaS | Gran potencia. Requiere gestión manual de parches, Docker y redes. | **Descartado** |
| **Render / Northflank** | PaaS | Muy sencillos. Los planes gratuitos suspenden la app por inactividad. | **Finalista** |
| **Google Cloud (Run)** | PaaS | Excelente Serverless, pero la gestión de permisos (IAM) es compleja. | **Finalista** |
| **DigitalOcean** | **PaaS** | **Equilibrio ideal: Crédito de 200 USD, App Platform intuitivo y registro integrado.** | **🏆 Elegido** |

---

## ✅ Justificación: DigitalOcean App Platform

> [!TIP]
> **¿Por qué DigitalOcean?**
> La elección se basa en la simplicidad operativa y la generosidad de los créditos del *GitHub Student Developer Pack*.

* **🛡️ Acceso Universal:** El crédito de **200 USD** elimina la barrera económica por completo.
* **⚙️ Modernidad:** Permite trabajar con **App Platform**, abstrayendo la complejidad de Kubernetes pero manteniendo la potencia de los contenedores.
* **🔋 Eficiencia:** La gestión de recursos permite mantener múltiples servicios activos sin agotar el presupuesto.
* **🔌 Ecosistema:** La integración nativa con la CLI `doctl` y GitHub Actions reduce drásticamente los tiempos de despliegue.

---

# 🧰 Stack de Herramientas de Despliegue

### 1. 🐳 Docker Desktop / Engine
* **Función:** Motor para empaquetar la aplicación y sus dependencias en imágenes inmutables.
* **Justificación:** Garantiza la paridad total entre el entorno de desarrollo y el de producción.

### 2. 🏗️ DigitalOcean Container Registry (DOCR)
* **Función:** Almacenamiento privado y seguro de imágenes Docker.
* **Justificación:** Al ser nativo, la latencia de despliegue es mínima y la seguridad está integrada con el ecosistema de la plataforma.

### 3. 🖥️ DigitalOcean CLI (`doctl`)
* **Función:** Interfaz de línea de comandos para gestionar recursos.
* **Justificación:** Permite la **automatización y documentación** técnica del proceso, facilitando la reproducibilidad del proyecto.

### 4. 🔗 GitHub Actions (CI/CD)
* **Función:** Automatización del flujo de trabajo desde el código a producción.
* **Justificación:** Implementa un flujo DevOps profesional: cada `push` construye la imagen, la sube al registro y actualiza el servicio automáticamente.

---

## 📊 Resumen Técnico

| Herramienta | Función Principal | Valor Académico |
| :--- | :--- | :--- |
| **Docker** | Empaquetado | Consistencia de entornos y portabilidad. |
| **doctl** | Gestión de Recursos | Automatización y documentación técnica. |
| **DOCR** | Registro de Imágenes | Seguridad y despliegue nativo optimizado. |
| **GitHub Actions** | Automatización (CI/CD) | Demostración de flujo DevOps profesional. |

---

# Configuración para despliegue desde repositorio

Primero necesitaremos crear una cuenta en digital ocean vinculada con nuestra cuenta github con student pack una vez creada crearemos un token para la API, para ello nos vamos al menu de la izquierda seleccionamos la opción 'API' y una vez dentro le damos a generate new token seleccionamos los accesos que necesitemos, en este caso para la práctica se han concedido acceso total. Con el token creado procedemos a instalar en la terminal usando `sudo snap install doctl` está será nuestra herramienta para desplegar la infraestructura mediante CLI. Una vez instalado es necesario ejecutar `doctl auth init` nos pedirá pegar el token una vez pegado ya podemos operar con doctl. También será necesario vincular una ssh-key para ello habrá que ejecutar `doctl compute ssh-key create NOMBRE_KEY --public-key "PEGAR_AQUÍ_LA_KEY_PUBLICA"` con esto ya es posible hacer una conexion a un droplet.

Lo siguiente a realizar dado que este proyecto necesita una BD y en caso de ser desplegada varias veces sería muy ineficiente dumpear y cargar el dump constantemente asi que será necesario crear un volumen externo en digital ocean para ello ejecutamos `doctl compute volume create datos-tfg --region fra1 --size 5Gi` fra1 es la región de Frankfurt de está forma se cumple con la legislación y se le da 5GB de tamaño para lo que se va a usar hay más que de sobra. Para comprobar su correcta creación se ejecuta `doctl compute volume list` y deberia dar el siguiente output:

![Foto imagen](https://github.com/paccco/TFGfinder/blob/main/imagenes/hito5/volList.png)

Es necesario copiar el id para el siguiente paso. Se procede a ejecutar el contenido del archivo **deploy.sh** será explicado:

### 📊 Desglose Técnico del Comando de Creación

| Parámetro | Valor | Función y Justificación |
| :--- | :--- | :--- |
| **Nombre del Host** | `dockeronubuntu2204host` | Identificador único del Droplet en el panel de control. |
| **`--image`** | `docker-20-04` | Selecciona una imagen del Marketplace que incluye **Docker y Docker Compose** preinstalados. |
| **`--size`** | `s-1vcpu-2gb` | Configuración de hardware: **1 vCPU y 2 GB de RAM** |
| **`--region`** | `fra1` | Despliegue en el centro de datos de **Frankfurt**|
| **`--enable-monitoring`** | *(Activado)* | Habilita la recopilación de métricas de rendimiento (CPU, RAM) sin coste adicional. |
| **`--ssh-keys`** | `52977094` | Vincula la clave pública SSH para permitir un **acceso seguro y sin contraseña**. |
| **`--volumes`** | `9efb5f...` | Adjunta una unidad de almacenamiento externo para asegurar la **persistencia de los datos**. |

En **deploy.sh** hay otro comando que es para los firewalls solo será necesario ejecutarlo 1 vez. De esta manera ya estaría el droplet funcionando lo siguiente será configurar el entorno de github para ello será necesario configurar las variables y secretos de actions en settings. Será necesario añadir 3 variables mínimo:

| Variable | Descripción | Propósito |
| :--- | :--- | :--- |
| **`DROPLET_IP`** | Dirección IP pública del servidor. | Indica a GitHub la ubicación exacta del host para realizar el despliegue. |
| **`DROPLET_USER`** | Nombre del usuario del sistema. | Define la identidad (generalmente `root`) con la que se ejecutarán los comandos. |
| **`SSH_PRIVATE_KEY`** | Clave privada RSA/ED25519. | Permite la autenticación segura mediante SSH sin necesidad de usar contraseñas. |

Una vez echo eso se creará un nuevo workflow en el caso de este proyecto: 
``` yml
name: Deploy TFGfinder

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: ${{ secrets.DROPLET_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            # Definir carpeta de trabajo en el home de root
            PROJECT_PATH="/root/TFGfinder"

            if [ ! -d "$PROJECT_PATH" ]; then
              git clone https://github.com/paccco/TFGfinder.git "$PROJECT_PATH"
            fi

            cd "$PROJECT_PATH"
            git pull origin main

            # Entrar en la carpeta del proyecto y reiniciar contenedores
            cd proyecto
            docker compose down
            docker compose up -d --build
```

Ya estaría listo la CI directa al IaaS

## 📊 Resultados de las Pruebas de Carga (Load Testing)

Para la prueba se ha ejecutado en la maquina local del desarrollador el siguiente comando:
`sudo docker run --rm jordi/ab -n 1000 -c 50 http://64.226.104.128:3000/`

Se han realizado pruebas de estrés para validar la robustez de la infraestructura en **DigitalOcean**. A continuación se detallan los resultados obtenidos tras el envío de 1,000 peticiones con una concurrencia de 50 usuarios:

| Métrica Clave | Valor Obtenido | Interpretación Técnica |
| :--- | :--- | :--- |
| **Peticiones por Segundo (RPS)** | 109.32 [#/sec] | Capacidad de procesar más de 100 usuarios por segundo de forma sostenida. |
| **Tasa de Fallos** | 0% (0 Failed) | El servidor respondió correctamente al 100% de las peticiones bajo presión. |
| **Tiempo Medio de Respuesta** | 457.37 ms | Latencia aceptable para una carga de 50 usuarios concurrentes. |
| **Percentil 90 (P90)** | 1,425 ms | El 90% de los usuarios recibió respuesta en menos de 1.5 segundos. |
| **Tiempo Máximo de Espera** | 2,956 ms | El peor caso no superó los 3 segundos, indicando que no hubo colapsos críticos. |

## Dominio de la app

Se puede comprobar el funcionamiento de la app en [http://64.226.104.128:3000]
