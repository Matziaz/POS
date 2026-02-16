## ✨ Características Principales

* **Arquitectura Offline-First:** Operación 100% local. El sistema no depende de una conexión a internet para registrar ventas, consultar inventario o realizar cobros.
* **Control de Accesos:** Sistema de roles (Administrador / Cajero) diseñado para proteger el flujo de caja, ocultar costos de proveedores a empleados y registrar cancelaciones.
* **Métricas "Mini-SAP":** Panel de control visual con estadísticas de ventas, identificación de "productos estrella" y control de stock mínimo.
* **Asistente Proactivo (IA):** Generación automática de cortes de caja y recomendaciones de reabastecimiento basadas en el historial de ventas, enviadas directamente al WhatsApp del propietario al cierre del turno.
* **Integración de Hardware:** Compatibilidad nativa con periféricos de punto de venta (impresoras térmicas ESC/POS, escáneres de códigos de barras y cajones de dinero).

## 🛠️ Stack Tecnológico

El proyecto está construido con tecnologías web empaquetadas para escritorio, priorizando el rendimiento en equipos de bajos recursos y la facilidad de distribución.

### 📦 Core / Entorno de Ejecución
* **[Electron](https://www.electronjs.org/):** Framework principal para empaquetar la aplicación web como un ejecutable de escritorio y gestionar la comunicación con el hardware local (puertos USB, impresoras).
* **Node.js:** Entorno de ejecución subyacente para los procesos del backend local.

### 🎨 Frontend / Interfaz de Usuario
* **[React](https://react.dev/):** Librería principal para la construcción de interfaces dinámicas y el manejo del estado complejo del módulo de ventas.
* **CSS / Tailwind CSS:** Estilizado de la aplicación con un enfoque en accesibilidad y usabilidad para pantallas táctiles (UI con elementos de interacción amplios).
* **[Recharts](https://recharts.org/):** Composición de gráficas y visualización de datos financieros en el dashboard analítico.

### 🗄️ Base de Datos Local
* **[SQLite](https://www.sqlite.org/):** Motor de base de datos transaccional, liviano y autocontenido en un solo archivo `.db`. Elimina la necesidad de configurar servidores de bases de datos en los equipos de los clientes.
* **[Prisma](https://www.prisma.io/) / Drizzle ORM:** Capa de abstracción y modelado de datos para realizar consultas tipadas y seguras desde el entorno de Node.js.

### 🤖 Integraciones y Automatización
* **[whatsapp-web.js](https://wwebjs.dev/):** Cliente de WhatsApp Web para Node.js. Permite la automatización del envío de notificaciones mediante la vinculación de la sesión vía código QR, sin requerir la API de Meta Business.
* **API de IA (Gemini / OpenAI):** Procesamiento en la nube de los resúmenes de ventas locales para generar inferencias y sugerencias de compra de inventario.
