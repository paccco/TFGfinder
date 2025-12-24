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
