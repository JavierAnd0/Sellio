# Sellio

# Plan de Calidad

# Versión 1.0

---

## Historia de Revisiones

| Fecha | Versión | Descripción | Autor |
|---|---|---|---|
| 20/05/2026 | 1.0 | Creación del documento | Alvaro Javier Andrade Ortiz |

---

## Contenido

- [1. Propósito](#1-propósito)
- [2. Referencias](#2-referencias)
- [3. Gestión](#3-gestión)
  - [3.1 Organización](#31-organización)
    - [3.1.1 Líneas de Trabajo](#311-líneas-de-trabajo)
    - [3.1.2 Responsables de las líneas de trabajo](#312-responsables-de-las-líneas-de-trabajo)
  - [3.2 Actividades](#32-actividades)
    - [3.2.1 Ciclo de vida del software cubierto por el Plan](#321-ciclo-de-vida-del-software-cubierto-por-el-plan)
    - [3.2.2 Actividades de Calidad a Realizarse](#322-actividades-de-calidad-a-realizarse)
    - [3.2.3 Relaciones entre las actividades de SQA y la planificación](#323-relaciones-entre-las-actividades-de-sqa-y-la-planificación)
  - [3.3 Responsables](#33-responsables)
- [4. Atributos de Calidad](#4-atributos-de-calidad)
  - [4.1 Requerimientos de Calidad del Producto a Construir](#41-requerimientos-de-calidad-del-producto-a-construir)
  - [4.2 Documentación](#42-documentación)
- [5. Estándares, prácticas, convenciones y métricas](#5-estándares-prácticas-convenciones-y-métricas)
  - [5.1 Estándar de documentación](#51-estándar-de-documentación)
  - [5.2 Estándar de Implementación](#52-estándar-de-implementación)
  - [5.3 Estándar de verificación y prácticas](#53-estándar-de-verificación-y-prácticas)
  - [5.4 Métricas a Utilizar](#54-métricas-a-utilizar)
- [6. Revisiones y auditorías](#6-revisiones-y-auditorías)
- [7. Verificación](#7-verificación)
- [8. Reporte de problemas y acciones correctivas](#8-reporte-de-problemas-y-acciones-correctivas)
- [9. Herramientas, técnicas y metodologías](#9-herramientas-técnicas-y-metodologías)
- [10. Gestión de riesgos](#10-gestión-de-riesgos)
- [11. Política de Calidad](#11-política-de-calidad)

---

## 1. Propósito

El objetivo de este plan es definir la calidad del software deseado para **Sellio** y describir cómo valorar esta calidad, estableciendo pautas y actividades que deben desarrollarse para garantizarla. Se identificarán para cada actividad los atributos de calidad relevantes, los métodos de evaluación y sus responsables.

Además, este plan brinda elementos de apoyo a la gestión del proyecto para realizar verificaciones sobre la adecuación al proceso y así detectar desvíos que puedan resultar en acciones correctivas en etapas tempranas.

**Sellio** es una plataforma de fidelización de clientes para comercios, construida sobre el stack Turborepo + Next.js 14 (App Router) + Supabase + Tailwind CSS + shadcn/ui. El producto permite a los comercios crear tarjetas de membresía digitales (sellos o puntos), gestionar clientes, administrar check-ins y cobrar suscripciones.

Este plan abarca las etapas del ciclo de vida relacionadas con: **M2 — Primer Cobro Real**, que comprende las fases de Construcción de Productos de Software (card builder, sistema de puntos, check-in, integración de pagos) y la fase de Presentación al primer cliente comercial. Las etapas de mantenimiento post-lanzamiento no están contempladas en la versión actual, sin embargo, se toman consideraciones acerca del futuro del producto en los atributos de mantenibilidad.

---

## 2. Referencias

```
[1] ANSI/IEEE Std 730.1-1989, IEEE Standard for Software Quality Assurance Plans.
[2] Documento "Estándar de Documentación Técnica" — convenciones de naming y estructura de archivos en Sellio.
[3] Documento "Estándar de Implementación" — convenciones TypeScript/React/Next.js del proyecto.
[4] Documento "Plan de Verificación y Validación" — estrategia de pruebas unitarias, de integración y E2E.
[5] Documento "Pautas de Interfaz de Usuario" — identidad visual Sellio: fondo #0D0B09, acento #E8341A, modo oscuro obligatorio.
[6] PLAN.md — Plan de Proyecto Sellio con roadmap M1–M4.
```

---

## 3. Gestión

La gestión del proyecto está a cargo de **Alvaro Javier Andrade Ortiz**, quien actúa simultáneamente como Administrador del Proyecto y Responsable de SQA. Se controla que las actividades se ajusten al plan propuesto y se minimizan posibles desviaciones a través de revisiones periódicas por milestone.

### 3.1 Organización

#### 3.1.1 Líneas de Trabajo

A continuación se identifican las distintas líneas de trabajo del proyecto y se analizan los distintos objetivos e interrelaciones. De esta forma, se comprenden las razones que motivan a asegurar la calidad de las mismas e identifican sus principales cometidos.

Las siguientes líneas de trabajo acompañan a todo el ciclo de vida del proyecto:

- **Gestión de Proyecto**

  Su principal objetivo es proveer la planificación del Proyecto, que incluye los objetivos y mecanismos de interacción entre las fases: M1 (Fundación), M2 (Primer Cobro), M3 (Escala), M4 (Monetización). Además, realiza estimaciones, mediciones y analiza la factibilidad del producto. El éxito del proyecto depende en gran medida de una buena Gestión, por lo que se debe prestar especial énfasis en la calidad de esta.

- **Gestión de la Configuración y Control de Cambios**

  Su principal objetivo es identificar, definir y gestionar los elementos del proyecto que deben estar bajo configuración (repositorio Git con Turborepo, ramas, versiones de paquetes, variables de entorno). Es de gran importancia para el desarrollo del proyecto, dado que debe asegurar que no existan inconsistencias en el sistema desarrollado, como por ejemplo conflicto de versiones entre `apps/web` y `packages/*`, o cambios no notificados que rompan la interfaz.

Además, la línea de trabajo sobre la que está este plan es la **Gestión de Calidad**, que realiza y controla la calidad del proceso y del sistema en desarrollo, asegurando el cumplimiento de las propiedades de calidad identificadas en este plan.

A continuación se identifican las principales líneas de trabajo que transcurren durante el ciclo de vida natural del proyecto:

- **Análisis de Requerimientos**

  Su principal objetivo es establecer y mantener un contrato con el cliente comercial que especifique qué debe hacer el sistema a construir; además define el alcance del producto. Proporciona mediante distintos productos (Especificación de Requerimientos, Modelo de Casos de Uso, Alcance del Sistema de Software) la base para las demás disciplinas.

- **Diseño**

  Su principal objetivo es, a partir de los requerimientos, diseñar lo que debe ser el sistema, definiendo de esta manera una arquitectura para el mismo. En Sellio esto abarca la arquitectura Turborepo multi-app, el modelo de datos en Supabase (PostgreSQL), y los patrones de componentes React/Next.js.

- **Implementación**

  Su principal objetivo es implementar los distintos módulos que luego se integran para formar el sistema. Los módulos principales son: `apps/web` (dashboard del comercio), `apps/cards` (tarjeta pública del cliente), `packages/database` (repositorios Supabase), `packages/payments` (integración Wompi). Además, efectúa la verificación unitaria de los componentes desarrollados.

- **Verificación**

  Su principal objetivo es verificar la correcta interacción e integración de los componentes del sistema y verificar que todos los requerimientos definidos en el Alcance hayan sido correctamente implementados. Debe identificar, comunicar y asegurar que los defectos sean corregidos antes de la liberación de cada milestone.

#### 3.1.2 Responsables de las líneas de trabajo

El equipo de trabajo puede observarse en el documento `PLAN.md`. A continuación se identifican los responsables según las distintas líneas de trabajo:

| Línea de Trabajo | Responsable |
|---|---|
| Gestión de Proyecto | Alvaro Javier Andrade Ortiz |
| Gestión de la Configuración y Control de Cambios | Alvaro Javier Andrade Ortiz |
| Análisis de Requerimientos | Alvaro Javier Andrade Ortiz |
| Diseño | Alvaro Javier Andrade Ortiz |
| Implementación | Alvaro Javier Andrade Ortiz |
| Verificación (SQA) | Alvaro Javier Andrade Ortiz |

### 3.2 Actividades

#### 3.2.1 Ciclo de vida del software cubierto por el Plan

A continuación se identifican los distintos productos de las etapas mencionadas en el punto anterior, los cuales estarán bajo revisiones de calidad.

**Gestión del Proyecto**

- PLAN.md — Plan de Proyecto
- Informe de Situación por Milestone
- Documento de Riesgos
- Calendario de Entregas por Milestone

**Configuración y Control de Cambios**

- Configuración de Turborepo (`turbo.json`, `pnpm-workspace.yaml`)
- Gestión de ramas Git y convenciones de commits (`commitlint.config.js`)
- Variables de entorno por ambiente (`.env.local`, Vercel Env)
- Informe de dependencias y versiones (`pnpm-lock.yaml`)

**Requerimientos y Análisis**

- Especificación de Requerimientos por Milestone
- Modelos de Casos de Uso (comercio y cliente final)
- Alcance del Sistema por Fase
- Glosario del dominio (membresía, sello, puntos, check-in, slug)

**Diseño**

- Descripción de la Arquitectura (Turborepo multi-app)
- Modelo de Datos Supabase (esquemas, migraciones, RLS policies)
- Arquitectura de Componentes React (card-renderer, card-form, BuilderState)

**Implementación**

- Estándar de Implementación (TypeScript strict, naming conventions)
- Plan de Desarrollo por Milestone
- Código fuente revisado: `card-renderer.tsx`, `card-form.tsx`, `customer.actions.ts`, `packages/database`
- Notas de Versión por Milestone

**Verificación**

- Plan de Verificación y Validación
- Registro de Pruebas Unitarias
- Registro de Verificación / Reporte de Pruebas
- Modelo de Casos de Prueba (flujos críticos: registro comercio, creación de tarjeta, check-in cliente, cobro Wompi)

#### 3.2.2 Actividades de Calidad a Realizarse

Las tareas a ser llevadas a cabo deberán reflejar las evaluaciones a realizar, los estándares, los productos a revisar, los procedimientos a seguir en la elaboración de los distintos productos y los procedimientos para informar de los defectos detectados a sus responsables y realizar el seguimiento de los mismos hasta su corrección.

Las actividades que se realizarán son:

1. Revisar cada producto
2. Revisar el ajuste al proceso
3. Realizar Revisión Técnica Formal (RTF)
4. Asegurar que las desviaciones son documentadas

**3.2.2.1 Revisar cada producto**

En esta actividad se revisan los productos que se definieron como claves para verificar en el Plan de Calidad.

Se debe verificar que no queden correcciones sin resolver en los informes de revisión previos; si se encuentra alguna no resuelta, debe ser incluida en la siguiente revisión. Se revisan los productos contra los estándares.

Se debe identificar, documentar y seguir la pista a las desviaciones encontradas y verificar que se hayan realizado las correcciones.

Como salida se obtiene el Informe de Revisión de SQA, que debe ser distribuido al responsable del producto (Alvaro Javier Andrade Ortiz) y se debe asegurar que es consciente de las desviaciones o discrepancias encontradas.

**3.2.2.2 Revisar el ajuste al proceso**

En esta actividad se revisan los productos que se definieron como claves para verificar el cumplimiento de las actividades definidas en el proceso. Con el fin de asegurar la calidad en el producto final del desarrollo, se deben llevar a cabo revisiones sobre los productos durante todo el ciclo de vida del software.

Se debe recoger la información necesaria de cada producto, buscando hacia atrás los productos previos que deberían haberse generado, para poder establecer los criterios de revisión y evaluar si el producto cumple con las especificaciones.

Esta información se obtiene de los siguientes documentos: `PLAN.md`, Plan de la Iteración del Milestone correspondiente, Plan de Verificación.

Antes de comenzar, se debe verificar en los informes de revisión previos que todas las desviaciones fueron corregidas; si no es así, las faltantes se incluyen para ser evaluadas.

Como salida se obtiene el Informe de Revisión de SQA correspondiente a la evaluación de ajuste al proceso.

**3.2.2.3 Realizar Revisión Técnica Formal (RTF)**

El objetivo de la RTF es descubrir errores en la función, la lógica o la implementación de cualquier producto del software, verificar que satisface sus especificaciones, que se ajusta a los estándares establecidos, señalando las posibles desviaciones detectadas. Es un proceso de revisión riguroso cuyo objetivo es detectar lo antes posible los posibles defectos o desviaciones en los productos que se van generando a lo largo del desarrollo.

La RTF se aplica en Sellio principalmente a: `card-renderer.tsx` (lógica de plantillas), `card-form.tsx` (estado del builder), `customer.actions.ts` (server actions con acceso a BD), y las migraciones de Supabase.

El resultado de esta revisión se plasmará en un informe de RTF registrado en el sistema de issues de GitHub.

**3.2.2.4 Asegurar que las desviaciones son documentadas**

Las desviaciones encontradas en las actividades y en los productos deben ser documentadas y ser manejadas de acuerdo a un procedimiento establecido.

Se debe chequear que el responsable modifique los planes cada vez que sea necesario, basado en las desviaciones encontradas. Toda desviación de importancia se registra como un GitHub Issue etiquetado con `quality`.

#### 3.2.3 Relaciones entre las actividades de SQA y la planificación

La relación entre las actividades de Calidad y el Plan de Gestión se describe a continuación. La agenda de revisiones está definida en el punto 6.4.

| Actividad | Milestone / Semana |
|---|---|
| Elaboración del Plan de Calidad | M2 — Semana 1 |
| Evaluar y ajustar el Plan de SQA | M2 — al cierre de cada sub-milestone |
| Evaluar la calidad de los entregables | M2.3, M2.4, M2.5 |
| Revisar el ajuste al proceso | Cada cierre de sub-milestone M2 |
| Revisión Técnica Formal (RTF) | Al completar módulos críticos |
| Realizar el informe final de calidad | Al cerrar M2 completo |

### 3.3 Responsables

El responsable de llevar a cabo los controles de calidad es **Alvaro Javier Andrade Ortiz**, en su rol de Responsable de SQA.

Luego de las revisiones de cada producto, se solicitará la atención del responsable del mismo para su corrección y comunicación de las acciones tomadas.

En el caso de las RTF, el responsable de SQA elabora un informe que incluya las acciones correctivas que deben ser tomadas para solucionar los problemas o desviaciones detectados. Toda acción correctiva queda registrada como GitHub Issue con etiqueta `quality`.

---

## 4. Atributos de Calidad

### 4.1 Requerimientos de Calidad del Producto a Construir

Los requerimientos de calidad del producto a construir son considerados dentro de atributos específicos del software que tienen incidencia sobre la calidad en el uso y se detallan a continuación. Cada uno de estos atributos debe cumplir con las normas y regulaciones aplicables.

---

**Funcionalidad**

**Adecuación a las necesidades.**
El producto a construir debe satisfacer las necesidades del comercio cliente y de los usuarios finales (clientes del comercio). Este aspecto debe darse en todo el producto: creación de tarjetas, gestión de clientes, acumulación de puntos/sellos, check-in y cobro de suscripción.

**Interoperabilidad.**
El sistema interoperará con los siguientes sistemas externos: **Supabase** (base de datos y autenticación), **Wompi** (pasarela de pagos Colombia), **Vercel** (hosting y edge functions). Se deben utilizar e implementar las interfaces definidas por cada proveedor, en especial en la comunicación con los webhooks de Wompi y las RLS policies de Supabase.

---

**Confiabilidad**

**Tolerancia a faltas.**
El sistema debe responder de manera aceptable ante faltas en la programación. Especialmente críticos son: el flujo de check-in público (`/check-in/[orgSlug]`) con rate limiting de 30 minutos, y el webhook de Wompi que no debe procesar pagos duplicados. Este aspecto debe ser considerado en todo el producto a construir.

**Disponibilidad.**
El sistema debe estar disponible para los clientes finales en todo momento, dado que la tarjeta pública (`apps/cards`) es el punto de interacción principal. Se deben contemplar estrategias de manejo de errores y fallbacks para el caso de indisponibilidad de Supabase.

---

**Usabilidad**

Desde el punto de vista de la Usabilidad, el producto tiene dos perfiles de usuario claramente diferenciados: el **comercio** (que usa el dashboard `apps/web`) y el **cliente final** (que usa la tarjeta pública `apps/cards`).

- **Comprensible**
  La interfaz del dashboard debe ser intuitiva para dueños de comercios sin formación técnica. La identidad visual oscura (#0D0B09, #E8341A) debe mantenerse consistente en todas las pantallas. La interfaz pública del cliente debe ser mínima y enfocada en la tarjeta de membresía.

- **Aprendible**
  El comercio debe poder crear su primera tarjeta de fidelización sin asistencia, siguiendo el flujo: Setup → Builder → Publicar. La experiencia de onboarding guiado es un atributo de calidad prioritario para el M2.5.

- **Operable**
  La tarjeta pública debe ser plenamente funcional en dispositivos móviles (responsive). El card builder debe funcionar correctamente en pantallas de escritorio.

---

**Mantenibilidad**

Este aspecto de calidad es fundamental dado que el producto de software debe ser capaz de recibir modificaciones luego de su entrega para agregar características que no estaban dentro del alcance del M2, y se espera que el desarrollo continúe hacia M3 y M4.

Es por ello que se identifican los siguientes atributos dentro de este:

- **Analizable** — el código debe ser comprensible para el responsable del proyecto al retomarlo tras interrupciones.
- **Modificable** — la arquitectura Turborepo debe permitir agregar nuevas apps y packages sin afectar los existentes.
- **Estable** — no se producen efectos inesperados luego de modificaciones; en especial, los cambios en `card-renderer.tsx` no deben romper `CardFromDesign` ni el builder.
- **Verificable** — cada módulo debe poder ser probado de forma aislada.
- **Evolucionabilidad** — el sistema de tarjetas debe poder extenderse con nuevos tipos (más allá de sellos y puntos) sin reescribir el card builder.

Estos aspectos deben ser cuidados en todo el producto, prestando especial atención al código generado en `card-form.tsx` (actualmente ~2100 líneas) y en los repositorios de `packages/database`.

### 4.2 Documentación

A continuación se establece la documentación necesaria para asegurar una buena calidad en las distintas áreas del ciclo del proyecto, además de explicitar los criterios de las revisiones.

#### 4.2.1 Documentación mínima requerida

La documentación mínima es la requerida para asegurar que la implementación logrará satisfacer los requerimientos.

**4.2.1.1 Especificación de requerimientos del software**

El documento de especificación de requerimientos deberá describir, de forma clara y precisa, cada uno de los requerimientos esenciales del software además de las interfaces externas (Supabase, Wompi, Vercel).

La especificación debe:
- Ser completa: externamente respecto al alcance acordado por milestone, e internamente sin elementos sin especificar.
- Ser consistente: no pueden haber elementos contradictorios entre milestones.
- Ser no ambigua: todo término referido al área de aplicación debe estar definido en el glosario del dominio (membresía, sello, puntos, slug, check-in, organización).
- Ser verificable: debe ser posible verificar, siguiendo un método definido, si el producto final cumple o no con cada requerimiento.
- Incluir requerimientos de calidad del producto a construir.

**4.2.1.2 Descripción del diseño del software**

El documento de diseño especifica cómo el software será construido para satisfacer los requerimientos. Deberá describir los componentes y subcomponentes del diseño del software, incluyendo interfaces internas entre `apps/web`, `apps/cards` y `packages/*`.

El diseño debe:
- Corresponder a los requerimientos a incorporar: todo elemento del diseño debe contribuir a algún requerimiento, y la implementación de todo requerimiento debe estar contemplada en por lo menos un elemento del diseño.
- Ser consistente con la calidad del producto.

**4.2.1.3 Plan de Verificación & Validación**

El Plan de V&V deberá identificar y describir los métodos a ser utilizados en:
- La verificación de que los requerimientos descritos en el documento de requerimientos son implementados en el diseño y que el diseño está implementado en código.
- La validación de que el código, cuando es ejecutado, se adecua a los requerimientos (flujos críticos: creación de tarjeta, check-in, acumulación de puntos, cobro Wompi).

**4.2.1.4 Reportes de Verificación & Validación**

Estos documentos deben especificar los resultados de la ejecución de los procesos descritos en el Plan de V&V. Se registran como GitHub Issues cerrados con etiqueta `verified` o como comentarios en los Pull Requests correspondientes.

**4.2.1.5 Plan de Gestión de Configuración**

El Plan de Gestión de Configuración debe contener métodos para identificar componentes de software, controlar e implementar cambios, y registrar y reportar el estado de los cambios implementados. En Sellio esto incluye la política de ramas Git, convenciones de commits (definidas en `commitlint.config.js`) y manejo de variables de entorno por ambiente.

#### 4.2.2 Otros documentos

**4.2.2.1 Plan de Proyecto**

El `PLAN.md` debe describir la planificación de forma completa del proyecto, de manera que pueda desarrollarse de forma controlada. Debe analizar su factibilidad, definir el alcance, describir las actividades de gestión que deben ser llevadas a cabo durante el proceso de desarrollo, definir mecanismos de control y ajuste para las distintas áreas del proyecto, establecer las líneas de trabajo, distribución de recursos humanos junto con sus responsabilidades y cronograma de trabajo. Además debe analizar los riesgos del proyecto con estrategias de mitigación, controles y planes de contingencia.

**4.2.2.2 Plan de Desarrollo por Milestone**

El plan de desarrollo debe describir la planificación de forma completa de cada fase de desarrollo del sistema de software, describiendo las actividades que se realizarán, su duración y quiénes son los responsables.

**4.2.2.3 Pautas de Interfaz de Usuario**

Este documento debe contener el relevamiento de las necesidades del cliente comercial en cuanto a la interfaz de usuario. Debe cumplir los atributos de usabilidad y amigabilidad de acuerdo a la identidad visual Sellio: fondo oscuro obligatorio (#0D0B09), color de acento (#E8341A), tipografías definidas en el card builder, y compatibilidad con dispositivos móviles para la tarjeta pública.

---

## 5. Estándares, prácticas, convenciones y métricas

### 5.1 Estándar de documentación

**Estándar de Documentos en General**

Para la elaboración de los documentos se utilizarán archivos Markdown (`.md`) ubicados en el directorio `/docs` del repositorio. En ellos se definen:

- Fuente de render: cualquier visor Markdown compatible con CommonMark / GitHub Flavored Markdown.
- Cada documento debe contar con un encabezado al principio que debe contener:
  - Título explicativo del contenido del documento
  - Versión del documento
  - Historial de versiones: número de versión, fecha, descripción de la modificación, responsable
- Índice del contenido con anclas a secciones.
- Es deseable que incluya al comienzo cuál es el objetivo del documento.

**Estándar de Documentación Técnica**

Por documentación técnica se entiende: diagramas de arquitectura, modelo de datos Supabase, diagramas de componentes React, flujos de API. Se utilizará Mermaid para diagramas embebidos en Markdown, y el esquema de base de datos se documenta mediante las migraciones de Supabase en `/packages/database/migrations`.

### 5.2 Estándar de Implementación

Como ya se ha mencionado, el producto de software a construir debe ser mantenible, comprensible y evolucionable. Es por ello que se deben seguir las siguientes convenciones de implementación:

- **TypeScript strict mode** habilitado en todos los packages y apps.
- **Naming conventions**: componentes en PascalCase, funciones y variables en camelCase, constantes en UPPER_SNAKE_CASE, archivos de componentes en kebab-case.
- **Server Actions**: toda operación de escritura a base de datos debe realizarse a través de Server Actions en `*.actions.ts`, nunca directamente desde componentes cliente.
- **Repository pattern**: toda operación a Supabase debe pasar por los repositorios definidos en `packages/database`, nunca llamar al cliente Supabase directamente desde `apps/`.
- **Identidad visual**: todo componente de UI que muestre la tarjeta o el dashboard del comercio debe respetar el fondo oscuro (#0D0B09) y el acento (#E8341A). No se admiten fondos blancos o claros en el card builder ni en el dashboard principal.
- **Gradientes**: toda construcción de gradientes debe pasar por la función `buildGradientBg` en `card-renderer.tsx`, nunca construir strings CSS de gradiente ad-hoc en otros componentes.

Las convenciones de implementación completas se definen en el documento "Estándar de Implementación" y se solicita especial atención del mismo por parte del equipo de desarrollo.

### 5.3 Estándar de verificación y prácticas

Se utilizarán las prácticas definidas en el documento "Plan de Verificación y Validación". Para Sellio se identifican los siguientes niveles de prueba:

- **Pruebas Unitarias**: funciones puras de cálculo de puntos (`calculate.ts`, `sign.ts`) y utilidades de `packages/`.
- **Pruebas de Integración**: flujos críticos contra Supabase (añadir puntos, crear membresía, check-in con rate limiting).
- **Pruebas E2E**: flujo completo de creación de tarjeta en el builder y flujo de check-in del cliente final.

### 5.4 Métricas a Utilizar

A continuación se definen las métricas a utilizar para medir el cumplimiento de los atributos de calidad definidos en el punto 4.

#### 5.4.1 Métricas de Adecuación al Estándar de Implementación

En las revisiones del código mediante las Revisiones Técnicas Formales se prestará especial énfasis en el cumplimiento de los estándares de implementación definidos en la sección 5.2. Se realizará un análisis exhaustivo de los ítems definidos en el documento.

Se espera que los siguientes indicadores se cumplan en un cien por ciento; de lo contrario, se solicitarán acciones correctivas para alcanzar el nivel de satisfacción deseado.

**Métrica de Adecuación a la Nomenclatura**

Sea **N** la cantidad total de identificadores definidos en el desarrollo del Sistema (variables, funciones, componentes, archivos) y llamemos **C** a la cantidad de identificadores que cumplen con los estándares de naming definidos en la sección 5.2.

> **Porcentaje de Adecuación a la Nomenclatura = (C / N) × 100**

**Métrica de Adecuación a las Convenciones de Acceso a Datos**

Sea **N** la cantidad total de operaciones de lectura/escritura a Supabase en el código fuente y llamemos **C** a la cantidad de operaciones que pasan correctamente por el Repository Pattern (`packages/database`) y/o Server Actions (`*.actions.ts`).

> **Porcentaje de Adecuación a las Convenciones de Acceso a Datos = (C / N) × 100**

**Métrica de Adecuación a la Identidad Visual**

Sea **N** la cantidad total de componentes de UI que renderizan tarjetas o pantallas del dashboard y llamemos **C** a la cantidad de componentes que respetan la paleta de colores definida (fondo oscuro, acento #E8341A, sin fondos claros no autorizados).

> **Porcentaje de Adecuación a la Identidad Visual = (C / N) × 100**

#### 5.4.2 Métrica de Adecuación a Pautas de Interfaz de Usuario

El documento de "Pautas de Interfaz de Usuario" define las políticas de interfaz a ser utilizadas teniendo en cuenta los tipos de usuarios (comercio y cliente final), la identidad de marca Sellio y el conjunto de patrones shadcn/ui con tema oscuro.

Se espera un cumplimiento del cien por ciento de estas pautas; de lo contrario, se solicitarán acciones correctivas para llegar al nivel de satisfacción deseado.

#### 5.4.3 Métrica del Cubrimiento de las Pruebas

Se realizarán pruebas Unitarias, de Integración y E2E, por lo que este punto tiene el objetivo de cuantificar la cantidad de pruebas realizadas sobre el total, lo cual nos sugiere una noción de verificación del sistema.

Sea **N** la cantidad total de pruebas a desarrollar según el Plan de V&V y llamemos **C** a la cantidad de pruebas efectivamente realizadas.

> **Porcentaje de Cubrimiento de las Pruebas de Milestone = (C / N) × 100**

#### 5.4.4 Métrica del Desempeño de las Pruebas contra Versión Anterior

Este punto nos permitirá tener la noción de cuántos se han corregido los errores detectados en las pruebas de un milestone anterior.

Sea **N** la cantidad total de errores detectados en el Milestone X del Sistema y llamemos **C** a la cantidad de errores arreglados en el Milestone X+1 del Sistema.

> **Porcentaje del Desempeño de las Pruebas contra Versión Anterior = (C / N) × 100**

#### 5.4.5 Métrica del Desempeño de las Pruebas en Versión Actual

Este punto nos permitirá tener la noción de cuán correcto es el sistema que se está construyendo.

Sea **N** la cantidad total de pruebas efectuadas y **C** la cantidad total de pruebas realizadas con resultado de éxito.

> **Porcentaje del Desempeño de las Pruebas de Versión Actual = (C / N) × 100**

---

## 6. Revisiones y auditorías

### 6.1 Objetivo

A continuación se definen las revisiones y auditorías técnicas y de gestión que se realizarán, especificando cómo se llevarán a cabo.

### 6.2 Revisiones

La salida de cada revisión será el "Informe de Revisión" sobre cada producto. Estas revisiones serán llevadas a cabo por el Responsable de SQA según las técnicas explicitadas en el punto 3.2.2.

**Revisión de requerimientos**

Esta revisión se realiza para asegurar que se cumplió con los requerimientos especificados para el Milestone y acordados con el cliente comercial objetivo.

**Revisión de diseño crítico**

Esta revisión se realiza para asegurar la consistencia del diseño detallado (arquitectura de componentes, modelo de datos Supabase) con la especificación de requerimientos.

**Revisión del Plan de Verificación & Validación**

Esta revisión se realiza para asegurar la consistencia y completitud de los métodos especificados en el Plan de V&V.

**Revisiones de gestión**

Estas revisiones se realizan periódicamente para asegurar la ejecución de todas las actividades identificadas en este Plan. La revisión se hará al cierre de cada sub-milestone (M2.3, M2.4, M2.5) por el Responsable de SQA.

**Revisión del Plan de Gestión de Configuración**

Esta revisión se realiza para asegurar la consistencia y completitud de los métodos especificados en el Plan de Gestión de Configuración (política de ramas, commits, variables de entorno).

**Revisión del Código Generado mediante RTF**

Esta revisión tendrá por objetivo revisar el código generado para verificar el cumplimiento de los Estándares de Implementación definidos en la sección 5.2. Se aplica prioritariamente a: `card-renderer.tsx`, `card-form.tsx`, `customer.actions.ts`, y repositorios de `packages/database`.

**Revisión del Cubrimiento de Pruebas mediante RTF**

Esta revisión tendrá por objetivo estudiar el cubrimiento de las pruebas realizadas para así obtener una noción de prueba del sistema. La métrica se explica en 5.4.3.

**Revisión del Desempeño de las Pruebas mediante RTF**

Esta revisión tendrá por objetivo estudiar el desempeño de las pruebas realizadas para así obtener una noción de la correctitud del sistema en base a los errores detectados en las pruebas de un milestone anterior. La métrica se explica en 5.4.4.

**Revisión Post Mortem**

Esta revisión se realiza al concluir el M2 para especificar las actividades de desarrollo implementadas durante el milestone y para proveer recomendaciones hacia M3.

### 6.3 Auditorías

**Auditoría funcional**

Esta auditoría se realiza previa a la liberación de cada milestone del software, para verificar que todos los requerimientos especificados para ese milestone fueron cumplidos. Esta auditoría la realizará el Responsable de SQA (Alvaro Javier Andrade Ortiz) contra los criterios de aceptación definidos en el `PLAN.md`.

Criterios de aceptación del M2 (referencia):
- Al menos 1 comercio pagando $35,000 COP/mes por 2 meses consecutivos.
- Flujo completo funcional: registro → creación de tarjeta → captación de clientes → acumulación de puntos → cobro.

**Auditorías internas al proceso**

Estas auditorías son para verificar la consistencia del código versus el documento de diseño, especificaciones de interfaz, implementaciones de diseño versus requerimientos funcionales, y requerimientos funcionales versus descripciones de casos de prueba.

### 6.4 Agenda

El calendario de revisiones se hace a partir de la finalización de M2.2 (completado), comenzando desde los sub-milestones M2.3 en adelante.

| Fase | Sub-Milestone | Actividad | Producto |
|---|---|---|---|
| M2 | M2.3 | RTF | `customer.actions.ts`, sistema de puntos |
| M2 | M2.3 | Revisión Producto | Plan de Verificación |
| M2 | M2.3 | Revisión Producto | Especificación de Requerimientos OTP/Realtime |
| M2 | M2.3 | Evaluar y Ajustar Plan de Calidad | Plan de Calidad |
| M2 | M2.4 | RTF | `packages/payments`, webhook Wompi |
| M2 | M2.4 | Revisión Producto | Plan de Configuración (env vars Wompi) |
| M2 | M2.4 | Auditoría Funcional | Flujo de cobro completo |
| M2 | M2.4 | Revisión de Gestión | PLAN.md, Informe de Situación |
| M2 | M2.5 | RTF | Código de onboarding, deploy producción |
| M2 | M2.5 | Revisión de Cubrimiento de Pruebas | Suite de pruebas completa |
| M2 | M2.5 | Auditoría Funcional | Sistema completo Sellio M2 |
| M2 | M2.5 | Revisión Post Mortem | — |

---

## 7. Verificación

La verificación se hará conforme a lo expresado en el documento "Plan de Verificación y Validación". Sin embargo, este punto puede sufrir modificaciones luego de las revisiones agendadas para cada sub-milestone.

Los flujos críticos que deben ser verificados antes del cierre de M2 son:

1. **Registro y onboarding de comercio** — creación de organización, plan activo, primer login.
2. **Creación de tarjeta** — setup pre-builder → builder completo → publicación con slug.
3. **Check-in de cliente** — acceso a `/check-in/[orgSlug]`, rate limit 30 min, registro en base de datos.
4. **Acumulación de puntos** — suma manual desde dashboard, actualización de `point_transactions` y `memberships.points`.
5. **Cobro Wompi** — creación de suscripción, webhook de confirmación, bloqueo por suscripción vencida.

---

## 8. Reporte de problemas y acciones correctivas

Luego de tener el Informe de la Revisión se solicitará, mediante la creación de un **GitHub Issue** etiquetado con `quality`, la atención del responsable sobre el documento o módulo. Además, se solicitará que comunique las discrepancias encontradas en el informe tanto como las correcciones hechas en el producto.

Luego, se planifica una nueva revisión para corroborar las acciones correctivas hechas por el responsable del producto. El Issue de GitHub permanece abierto hasta que la corrección sea verificada; una vez verificada, se cierra con referencia al commit o Pull Request correctivo.

---

## 9. Herramientas, técnicas y metodologías

Las técnicas a utilizar se definieron en el punto 3; además, se utilizarán las siguientes herramientas de soporte:

| Herramienta | Propósito |
|---|---|
| **GitHub Issues** | Registro y seguimiento de desviaciones y acciones correctivas |
| **GitHub Pull Requests** | Revisión de código antes de merge a `main` |
| **Vercel Preview Deployments** | Verificación de cambios en ambiente controlado antes de producción |
| **Supabase Dashboard** | Auditoría de datos, RLS policies y logs de autenticación |
| **TypeScript compiler (`tsc`)** | Verificación estática de tipos en todos los packages |
| **ESLint / commitlint** | Verificación de convenciones de código y commits |
| **Listas de comprobación (checklists)** | Apoyo a las revisiones RTF; se realizarán para cada revisión tomando como base los estándares definidos en la sección 5 |

---

## 10. Gestión de riesgos

Los riesgos identificados, la estrategia de mitigación, monitoreo y plan de contingencia a ser llevados a cabo están definidos en el documento de "Gestión de Riesgos" (sección correspondiente de `PLAN.md`).

Los principales riesgos de calidad identificados para el M2 son:

| Riesgo | Impacto | Estrategia de Mitigación |
|---|---|---|
| Regresión visual al modificar `card-form.tsx` o `card-renderer.tsx` | Alto | RTF antes de merge; revisar identidad visual con lista de comprobación |
| Inconsistencia entre `buildGradientBg` y estilos ad-hoc | Alto | Métrica 5.4.1; prohibición en estándar de implementación |
| Webhook Wompi sin idempotencia | Crítico | RTF del módulo `packages/payments`; prueba de integración con payload duplicado |
| RLS policies de Supabase incorrectas | Crítico | Auditoría de políticas antes de deploy a producción |
| Deuda técnica acumulada en `card-form.tsx` (~2100 líneas) | Medio | Revisión de mantenibilidad en RTF; considerar refactor post-M2 |

---

## 11. Política de Calidad

Consideraremos que el producto está en un nivel aceptable de calidad si se cumplen el cien por ciento de los atributos de calidad identificados en el punto "4: Atributos de Calidad".

Utilizaremos las métricas definidas en el punto "5: Estándares, prácticas, convenciones y métricas" de forma tal de medir dichos atributos, para así tener una noción general de calidad del producto y consecuentemente solicitar las acciones correctivas que sean necesarias.

Este proceso se llevará a cabo con las revisiones y auditorías definidas en el punto "6: Revisiones y auditorías" según el cronograma definido en "6.4: Agenda".

**Criterio de aceptación de calidad para M2:** el sistema puede pasar a producción cuando:
- Las métricas 5.4.1 (adecuación a estándares) alcanzan el 100%.
- La métrica 5.4.3 (cubrimiento de pruebas) alcanza el 80% mínimo para los flujos críticos listados en la sección 7.
- La métrica 5.4.5 (desempeño de pruebas actuales) alcanza el 90% mínimo.
- No existen GitHub Issues abiertos con etiqueta `quality` y prioridad `critical` o `high`.
- La auditoría funcional de M2.5 fue superada satisfactoriamente.
