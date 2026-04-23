# Sistema de Gestión de Proyectos Académicos (e2_backend)

Este proyecto consta de un **Backend** (API con Node.js, Express y Prisma) y un **Frontend** (Vue.js con Vite).

## Cómo ejecutar el proyecto

Para correr el proyecto completo, necesitas abrir **dos terminales** diferentes:

### 1. Iniciar el Backend
Desde la raíz del proyecto, ejecuta:
```bash
cd backend
npm run dev
```
*   **Puerto:** [http://localhost:3001](http://localhost:3001)
*   **Documentación API:** [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

### 2. Iniciar el Frontend
Desde la raíz del proyecto, en otra terminal, ejecuta:
```bash
cd frontend
npm run dev
```
*   **Puerto:** Generalmente [http://localhost:5173](http://localhost:5173) (o el que indique la terminal si el 5173 está ocupado).

---

## Requisitos Previos
- **Node.js** instalado.
- **MySQL** corriendo con la base de datos `gestor_proyectos` creada (configurada en `backend/.env`).
- Ejecutar `npm install` en ambas carpetas (`backend` y `frontend`) la primera vez.

## Scripts Útiles (Backend)
- `npm run seed`: Para poblar la base de datos con datos de prueba iniciales.
- `npx prisma studio`: Para ver y editar los datos de la base de datos visualmente.

## Arquitectura del Sistema

El backend sigue una arquitectura multicapa modular estructurada de la siguiente manera:

```mermaid
flowchart TD
    %% ===== Estilos =====
    classDef frontend fill:#41B883,stroke:#35495E,stroke-width:1px,color:#ffffff
    classDef entry    fill:#FEF3C7,stroke:#B45309,stroke-width:1px,color:#78350F
    classDef layer    fill:#EDE9FE,stroke:#6D28D9,stroke-width:1px,color:#4C1D95
    classDef helper   fill:#F3F4F6,stroke:#6B7280,stroke-width:1px,color:#374151
    classDef database fill:#DBEAFE,stroke:#1D4ED8,stroke-width:1px,color:#1E3A8A

    %% ===== Nodos =====
    Client["💻 Cliente — Frontend Vue 3<br/><i>Vite · Pinia · Router · Axios · Tailwind</i>"]:::frontend

    subgraph Backend ["🐳 Backend Node.js + Express + TypeScript (Docker)"]
        direction TB
        API["🚀 app.ts / server.ts<br/><i>Middlewares · Rutas base · Swagger</i>"]:::entry
        Auth["🛡️ Auth middleware (JWT)"]:::helper

        subgraph Modulo ["📦 Módulo de dominio (ej. Proyectos)"]
            direction TB
            Router["📡 Router — capa de presentación<br/><i>proyecto.router.ts</i>"]:::layer
            Zod["✅ Zod schema<br/><i>proyecto.schema.ts</i>"]:::helper
            Service["⚙️ Service — capa de negocio<br/><i>proyecto.service.ts</i>"]:::layer
            Mapper["🔄 Mapper<br/><i>proyecto.mapper.ts</i>"]:::helper
            ErrorH["⚠️ Error handler<br/><i>captura AppError</i>"]:::helper
            Repository["💾 Repository — capa de datos<br/><i>proyecto.repository.ts</i>"]:::layer
        end

        Prisma["🗃️ Prisma client (ORM)"]:::entry
    end

    DB[("🛢️ MySQL")]:::database

    %% ===== Flujo principal =====
    Client -- "Petición HTTP / REST" --> API
    API --> Auth
    Auth --> Router
    Router --> Service
    Service --> Repository
    Repository --> Prisma
    Prisma -- "TCP/IP" --> DB

    %% ===== Relaciones auxiliares =====
    Router -. "valida entrada" .-> Zod
    Service -. "formatea DTOs" .-> Mapper
    Service -. "lanza excepción" .-> ErrorH
```
