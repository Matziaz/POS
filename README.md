# POS Polimórfico

Sistema de Punto de Venta (POS) diseñado para micro-comercios, con foco en simplicidad, operación offline y adaptabilidad según el tipo de negocio.

El sistema está pensado para correr en hardware de bajo costo (Raspberry Pi) y generar información accionable sin requerir conocimientos técnicos por parte del comerciante.

---

## Estado del proyecto

**En desarrollo activo — Fase MVP**

El proyecto se encuentra en una etapa temprana, priorizando funcionalidad esencial y validación de uso real por sobre optimizaciones avanzadas.

---

## Objetivo del producto

Construir un POS mínimo funcional que permita:

- Registrar ventas de manera rápida y confiable
- Adaptarse a distintos tipos de comercio (abarrotes, ferretería, etc.)
- Operar completamente sin conexión a internet
- Generar reportes simples que ayuden al comerciante a tomar decisiones

---

## Alcance inicial (MVP)

El MVP contempla únicamente las siguientes funcionalidades:

- Registro de productos
- Registro de ventas
- Persistencia local de la información
- Corte de caja diario

Cualquier funcionalidad fuera de este alcance debe ser discutida y priorizada explícitamente.

---

## Principios del sistema

Este proyecto se guía por los siguientes principios:

- **Offline first:** el sistema debe funcionar sin internet
- **Simplicidad sobre complejidad:** evitar sobreingeniería
- **Valor antes que perfección:** algo usable es mejor que algo incompleto
- **Adaptabilidad:** el dominio debe permitir distintos tipos de negocio

---

## Hardware objetivo

- Raspberry Pi (modelo a definir)
- Sistema operativo Linux

El sistema debe poder ejecutarse en entornos de recursos limitados.

---

## Instalación y ejecución (desarrollo)

**Nota:** Los pasos específicos pueden variar según la tecnología final elegida.

**Requisitos generales:**

- Sistema Linux
- Entorno de ejecución del proyecto (lenguaje / runtime correspondiente)

**Pasos generales:**

1. Clonar el repositorio
2. Instalar dependencias
3. Ejecutar el proyecto en entorno local
4. Verificar funcionamiento offline

---

## Documentación

La documentación detallada del proyecto se encuentra en el directorio `docs/`:

- **Visión del producto:** `docs/vision.md`  
  Describe el problema, el usuario objetivo y los límites del producto.

- **Roadmap:** `docs/roadmap.md`  
  Define los objetivos por sprint y la evolución esperada del sistema.

- **Arquitectura:** `docs/architecture.md`  
  Explica la estructura general del sistema y las decisiones técnicas clave.

---

## Forma de trabajo

- Todo el trabajo se gestiona mediante **issues**
- Cada issue representa una **Historia de Usuario**
- No se desarrolla funcionalidad que no esté reflejada en un issue
- El roadmap **no es una lista de tareas**, es una guía estratégica

---

## Definition of Done (resumen)

Una funcionalidad se considera terminada cuando:

- Cumple los criterios de aceptación del issue
- Funciona correctamente en el hardware objetivo
- No rompe funcionalidades existentes
- Mantiene el principio de operación offline

---

## Contribución

Este proyecto se encuentra en una etapa temprana. Las contribuciones deben alinearse con la visión y el alcance definido.

**Antes de implementar nuevas ideas:**

1. Abrir un issue
2. Discutir el valor para el comerciante
3. Validar que esté dentro del roadmap

---

## Nota final

Este proyecto prioriza el impacto real en micro-comercios por sobre la complejidad técnica.

Si una decisión no mejora la experiencia del usuario final, probablemente no sea la correcta.