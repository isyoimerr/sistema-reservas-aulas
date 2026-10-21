# Sistema de Reservas de Aulas

> Proyecto de grado para la gestión institucional de aulas, horarios, usuarios y reservas académicas.

<p align="center">
  <img src="img/Laboratorio%20escolar%20de%20programaci%C3%B3n.png" alt="Portada del sistema de reservas de aulas" width="100%" />
</p>

<p align="center">
  <img alt="PHP" src="https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white" />
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
  <img alt="Proyecto de grado" src="https://img.shields.io/badge/Proyecto%20de%20grado-Universidad-0EA5E9?style=flat-square" />
</p>

## 🌐 Demo / prototipo

La versión en línea del prototipo queda disponible aquí:

**https://sistema-reservas-aulas-fkhm.vercel.app/login**

> Esta web es una vista de demostración del proyecto en desarrollo y no reemplaza la plataforma oficial institucional. Su propósito principal es mostrar el flujo funcional, la arquitectura del sistema y el avance del desarrollo del proyecto de grado.

## 👋 Presentación del proyecto

Hola, somos el equipo de desarrollo de este proyecto.

Este repositorio contiene una solución tecnológica desarrollada para la institución educativa **José Agustín Blanco Barros**, con el propósito de mejorar la administración del uso de aulas, horarios y reservas académicas.

La idea central es digitalizar y organizar un proceso que, en muchos contextos institucionales, se maneja de forma manual o poco estructurada. Con esta herramienta buscamos reducir errores, mejorar la planificación académica y crear una experiencia más clara tanto para docentes como para personal administrativo.

## 🏫 Institución educativa

**Institución Educativa José Agustín Blanco Barros**

Esta solución fue creada pensando en la realidad y necesidades de esta institución, con un enfoque práctico y orientado a la gestión académica diaria.

## 🧠 ¿De qué trata el proyecto?

El sistema permite gestionar de forma centralizada:

- reservas de aulas,
- horarios docentes,
- usuarios con roles definidos,
- aprobación y seguimiento de solicitudes,
- administración académica y operativa,
- reportes y control del uso de espacios.

El objetivo es transformar un proceso manual y propenso a errores en una solución digital ordenada, segura y eficiente.

## 🧑‍💻 ¿Quiénes lo desarrollaron?

Este proyecto fue desarrollado como parte de un trabajo académico y de grado, con enfoque en la resolución de un problema real del entorno institucional.

La intención no es presentar una solución comercial o una plataforma final institucional completa, sino una propuesta funcional, bien estructurada y preparada para mostrar el desarrollo realizado, la lógica aplicada y la arquitectura del sistema.

## 🎯 ¿Cuál es el problema que resuelve?

En la práctica, la gestión de aulas y reservas suele hacerse de manera manual o poco organizada, lo que puede causar:

- conflictos de horario,
- uso duplicado de una misma aula,
- pérdida de tiempo en coordinación,
- dificultad para consultar disponibilidad,
- poca trazabilidad de solicitudes.

Este sistema busca resolver esos inconvenientes desde una sola plataforma con validaciones y roles definidos.

## ✨ Funcionalidades principales

- gestión de aulas y disponibilidad,
- registro de usuarios y roles,
- login con acceso diferenciado,
- creación y validación de reservas,
- revisión de conflictos de horario,
- panel administrativo con métricas,
- seguimiento de estados de solicitudes,
- gestión de permisos por perfil,
- flujo preparado para despliegue web institucional.

## 🧩 Roles del sistema

### Superadministrador
Puede gestionar usuarios, reservas, aulas, horarios y reportes.

### Profesor
Puede consultar y registrar sus solicitudes de reserva, así como revisar la disponibilidad del sistema.

## 🛠️ Stack tecnológico

<p align="center">
  <img alt="PHP" src="https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white" />
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  <img alt="Bootstrap" src="https://img.shields.io/badge/Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
</p>

## 📌 Cómo funciona el sistema

1. El usuario inicia sesión con sus credenciales.
2. El sistema identifica su rol.
3. Según su perfil, accede a las opciones disponibles.
4. El usuario solicita o administra una reserva.
5. El sistema valida horario, aula y disponibilidad académica.
6. La reserva queda registrada y disponible para seguimiento administrativo.

## 📸 Capturas del proyecto

<div align="center">
  <img src="img/Laboratorio%20escolar%20de%20programaci%C3%B3n.png" alt="Laboratorio de programación" width="420" />
  <img src="img/Docente%20observa%20laboratorio%20de%20computaci%C3%B3n.png" alt="Docente observando laboratorio" width="420" />
</div>

## 📁 Estructura del repositorio

```text
.
├── admin/
├── aulas/
├── config/
├── css/
├── database/
├── docs/
├── horarios/
├── img/
├── js/
├── login/
├── migracion-vercel/
├── reportes/
├── reservas/
├── supabase/
├── usuarios/
├── dashboard.php
├── index.php
├── package.json
├── README.md
├── run.bat
├── run.ps1
└── .env.local
```

## ⚙️ Requisitos del proyecto

- PHP 8 o superior
- MySQL / MariaDB
- Navegador moderno
- Entorno local o institucional con acceso a la base de datos
- Variables de entorno configuradas para Supabase

## 🔐 Configuración

El proyecto usa variables de entorno para conectarse con Supabase. En la versión web migrada se deben definir correctamente:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_del_proyecto
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

> No se comparten claves ni credenciales aquí. La configuración real debe mantenerse en el entorno de despliegue y seguridad correspondiente.

## 🚀 Estado del proyecto

El sistema se encuentra actualmente en una etapa de prototipo funcional y consolidación para uso institucional. La solución incluye:

- autenticación por roles,
- administración de reservas,
- control de aulas y docentes,
- panel administrativo,
- migración moderna a Next.js,
- preparación para despliegue web institucional.

> Este proyecto es un prototipo de desarrollo para mostrar la lógica del sistema, la propuesta de solución y el avance académico. No sustituye la plataforma oficial institucional ni la operación final de la institución.

## 📈 Impacto institucional

Este proyecto aporta valor a la institución al:

- mejorar la organización del uso de espacios,
- reducir errores y conflictos de programación,
- agilizar la gestión administrativa,
- fortalecer la planificación académica,
- ofrecer una herramienta digital moderna y sostenible.

## ✅ Conclusión

Este repositorio representa un proyecto de grado con un enfoque real, práctico y útil para el entorno educativo. Su objetivo principal es dar solución a una necesidad institucional concreta: optimizar la gestión de reservas de aulas y horarios de manera organizada, visible y segura.

La finalidad no es solo mostrar código, sino dejar evidencia de un desarrollo pensado para la institución, con una lógica sólida, una arquitectura funcional y una propuesta clara para la administración académica.

---

<p align="center">
  <img alt="Proyecto académico" src="https://img.shields.io/badge/Proyecto%20acad%C3%A9mico-Desarrollo%20institucional-10B981?style=flat-square" />
</p>
