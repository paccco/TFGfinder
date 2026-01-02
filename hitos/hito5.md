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

Primero necesitaremos crear una cuenta en digital ocean vinculada con nuestra cuenta github con student pack una vez creada crearemos un token para la API, para ello nos vamos al menu de la izquierda seleccionamos la opción 'API' y una vez dentro le damos a generate new token seleccionamos los accesos que necesitemos, en este caso para la práctica se han concedido acceso total. Con el token creado procedemos a instalar en la terminal usando `sudo snap install doctl` está será nuestra herramienta para desplegar la infraestructura mediante CLI. Una vez instalado es necesario ejecutar `doctl auth init` nos pedirá pegar el token una vez pegado ya podemos operar con doctl. Lo siguiente a realizar dado que este proyecto necesita una BD y en caso de ser desplegada varias veces sería muy ineficiente dumpear y cargar el dump constantemente asi que será necesario crear un volumen externo en digital ocean para ello ejecutamos
