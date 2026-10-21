# Sistema de Reservas de Aulas

> Proyecto de grado para la gestión institucional de aulas, horarios, usuarios y reservas académicas.

<p align="center">
  <img alt="PHP" src="https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white" />
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
  <img alt="Proyecto de grado" src="https://img.shields.io/badge/Proyecto%20de%20grado-Universidad-0EA5E9?style=flat-square" />
</p>

Hola 👋

Este repositorio contiene un sistema web orientado a resolver una necesidad real de la institución educativa: la organización del uso de aulas y horarios, evitando conflictos de programación y mejorando la administración académica.

## ¿De qué trata este proyecto?

El sistema permite gestionar de forma centralizada:

- reservas de aulas,
- horarios docentes,
- usuarios con roles definidos,
- aprobación y seguimiento de solicitudes,
- administración académica y operativa,
- reportes y control del uso de espacios.

La idea principal es transformar un proceso manual y propenso a errores en una solución digital ordenada, segura y eficiente.

## ¿Quién lo desarrolló y para quién es?

Este proyecto es un proyecto de grado desarrollado para apoyar la operación interna de una institución educativa. Está pensado para facilitar la labor de:

- docentes,
- coordinación académica,
- personal administrativo,
- dirección y supervisión institucional.

Su objetivo es ofrecer una herramienta útil para la realidad académica diaria, con un enfoque práctico y profesional.

## ¿Cuál es el problema que resuelve?

En muchas instituciones, la gestión de aulas y reservas se realiza de forma desorganizada, mediante registros manuales o comunicaciones informales. Esto puede generar:

- conflictos de horario,
- doble uso de un aula,
- pérdidas de tiempo,
- dificultad para consultar disponibilidad,
- poca trazabilidad de las solicitudes.

Este sistema busca solucionar ese problema desde una plataforma única, con validaciones y control por perfiles.

## Funcionalidades principales

- gestión de aulas y disponibilidad,
- registro de usuarios y roles,
- login con acceso diferenciado,
- creación y validación de reservas,
- revisión de conflictos de horario,
- panel administrativo con métricas,
- seguimiento de estados de solicitudes,
- gestión de permisos por perfil,
- flujo preparado para entorno institucional y despliegue web.

## Roles del sistema

### Superadministrador
Puede gestionar usuarios, reservas, aulas, horarios y reportes.

### Profesor
Puede consultar y registrar sus solicitudes de reserva, así como revisar la disponibilidad del sistema.

## Stack tecnológico

<p align="center">
  <img alt="PHP" src="https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white" />
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  <img alt="Bootstrap" src="https://img.shields.io/badge/Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
</p>

## Cómo funciona el sistema

1. El usuario inicia sesión con sus credenciales.
2. El sistema identifica su rol.
3. Según su perfil, accede a las opciones disponibles.
4. El usuario solicita o administra una reserva.
5. El sistema valida horario, aula y disponibilidad académica.
6. La reserva queda registrada y disponible para seguimiento administrativo.

## Capturas del proyecto

<div align="center">
  <img src="img/Laboratorio%20escolar%20de%20programaci%C3%B3n.png" alt="Laboratorio de programación" width="420" />
  <img src="img/Docente%20observa%20laboratorio%20de%20computaci%C3%B3n.png" alt="Docente observando laboratorio" width="420" />
</div>

## Estructura del repositorio

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

## Requisitos del proyecto

- PHP 8 o superior
- MySQL / MariaDB
- Navegador moderno
- Entorno local o institucional con acceso a la base de datos
- Variables de entorno configuradas para Supabase

## Configuración rápida

El proyecto usa variables de entorno para conectarse con Supabase. En la app de migración se deben definir correctamente:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_del_proyecto
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

## Estado del proyecto

El sistema se encuentra en una fase de consolidación como solución funcional para uso institucional. Incluye:

- autenticación por roles,
- administración de reservas,
- control de aulas y docentes,
- panel administrativo,
- migración moderna a Next.js,
- preparación para despliegue web institucional.

## Impacto institucional

Este proyecto aporta valor a la institución al:

- mejorar la organización del uso de espacios,
- reducir errores y conflictos de programación,
- agilizar la gestión administrativa,
- fortalecer la planificación académica,
- ofrecer una herramienta digital moderna y sostenible.

## Conclusión

Este repositorio representa un proyecto de grado con un enfoque real, práctico y útil para el entorno educativo. No es solo una demostración técnica: es una solución pensada para resolver un problema cotidiano de la institución y mejorar la administración académica.

La meta es dejar un sistema funcional, claro y aplicable a un contexto real, con una base sólida para un despliegue institucional futuro.

---

<p align="center">
  <img alt="Hecho para la institución" src="https://img.shields.io/badge/Hecho%20para%20la%20instituci%C3%B3n-Administraci%C3%B3n%20Acad%C3%A9mica-10B981?style=flat-square" />
</p>
