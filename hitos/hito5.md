## 📑 Criterios de Selección (Justificación)

Para determinar la plataforma ideal para desplegar nuestra aplicación en contenedores, se han priorizado los siguientes cuatro pilares:

1.  **💰 Sostenibilidad Económica:** Se usarán modelos que nos proporcionen coste cero en el entorno y contexto dado
    
2.  **🏗️ Abstracción y Facilidad de Gestión (PaaS vs IaaS):** Un IaaS ofrece control total, un **PaaS (Plataforma como Servicio)** permite centrarse en el código y el contenedor, delegando la gestión del sistema operativo y la red al proveedor.

3.  **📈 Eficiencia y Escalado:** Se busca que la plataforma permita el **"escalado a cero" (Serverless)**. Esto asegura que los recursos solo se consuman cuando hay tráfico activo, optimizando al máximo los créditos gratuitos.

4.  **🔄 Integración con el Flujo de Trabajo (CI/CD):** La capacidad de conectar el repositorio de GitHub y automatizar el despliegue del contenedor.

---

## 🔍 Evaluación de Opciones Valoradas

Se han analizado las siguientes opciones bajo los criterios anteriormente descritos:

| Opción | Modelo | Evaluación Técnica | Decisión |
| :--- | :--- | :--- | :--- |
| **Oracle Cloud** | IaaS | Gran potencia (24GB RAM). Requiere gestión manual de seguridad, Docker y parches del SO. | **Descartado** por alta carga administrativa. |
| **Render / Northflank** | PaaS | Muy sencillos de usar. Sin embargo, los planes gratuitos presentan limitaciones en disponibilidad y latencia. | **Finalista** por simplicidad. |
| **Google Cloud (Run)** | PaaS | Excelente modelo Serverless, pero la gestión de permisos (IAM) es compleja para un proyecto rápido. | **Finalista** por robustez. |
| **Azure (Container Apps)** | **PaaS** | **Ganador.** Equilibrio entre crédito gratuito (100 USD), escalado a cero (KEDA) y nivel gratuito de 2M de peticiones. | **Elegido para el proyecto.** |

---

## ✅ Justificación de la Elección Final: Azure Container Apps

La decisión de utilizar **Azure Container Apps (vía GitHub Student Pack)** se justifica por los siguientes puntos clave:

* **🛡️ Acceso Universal:** El acceso mediante el pack de estudiante elimina la barrera económica.
* **⚙️ Modernidad Tecnológica:** Al estar basado en Kubernetes pero ser gestionado, permite trabajar con herramientas importantes mencionadas en la asignatura.
* **🔋 Eficiencia Energética y de Crédito:** El escalado dinámico garantiza que el crédito de 100 USD dure todo el periodo lectivo, ya que la aplicación solo "consume" mientras está siendo evaluada.
* **🔌 Ecosistema Nativo:** La integración con GitHub y VS Code reduce drásticamente el tiempo de despliegue a producción.

---

# Descripción y Justificación de las Herramientas de Despliegue

---

## 🧰 Stack de Herramientas Utilizadas

### 1. 🐳 Docker Desktop / Docker Engine
**Descripción:** Motor de contenedores utilizado para empaquetar la aplicación, sus dependencias y su configuración en una imagen inmutable.
* **Justificación:** Permite garantizar que la aplicación funcione exactamente igual en el entorno de desarrollo local que en la nube de Azure.

### 2. 🏗️ Azure Container Registry (ACR)
**Descripción:** Servicio de registro de Docker privado gestionado por Microsoft.
* **Justificación:** Se utiliza para almacenar y gestionar nuestras imágenes de contenedor de forma segura. Al ser un servicio nativo de Azure, la integración con *Container Apps* es inmediata y ofrece una latencia mínima en el despliegue.

### 3. 🖥️ Azure CLI (Command Line Interface) o GUI(Graphic User Interface)
**Descripción:** Herramienta de comandos para interactuar con los recursos de Azure desde la terminal.
* **Justificación:** A priori se prefiere el uso de la CLI sobre el portal web (GUI) por su capacidad de **automatización y transparencia**. Permite documentar los pasos exactos del despliegue en este trabajo, facilitando la reproducibilidad del proyecto.

### 4. 🔗 GitHub Actions (CI/CD)
**Descripción:** Plataforma de automatización integrada en GitHub para ejecutar flujos de trabajo.
* **Justificación:** Permite implementar un flujo de **Integración y Despliegue Continuo**. Cada vez que realizamos un `push` al repositorio, la herramienta construye la imagen de Docker, la sube al registro y actualiza la aplicación en Azure automáticamente.

---

## 📊 Resumen de Herramientas y su Función

| Herramienta | Función Principal | Justificación Académica |
| :--- | :--- | :--- |
| **Docker** | Empaquetado de App | Consistencia de entornos y portabilidad. |
| **Azure CLI** | Gestión de Recursos | Automatización y documentación técnica. |
| **ACR** | Almacenamiento de Imágenes | Seguridad y despliegue nativo en Azure. |
| **GitHub Actions** | Automatización (CI/CD) | Demostración de flujo DevOps profesional. |

---
