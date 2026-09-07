# TF Software Seguro — Ciclo de Vida Completo (Secure SDLC)

Auditoría, remediación y automatización de seguridad sobre una API REST basada en
RealWorld (Conduit), Node.js/Express + Prisma + SQLite con autenticación JWT.

Repositorio del Trabajo Final. Maestría en Ingeniería de Software, curso Software Seguro
(Universidad Rafael Landívar). Autor: Andres Jose Pineda Robles (EST1067817).

## Historia del repositorio (rojo → verde)

El proyecto se auditó con el ciclo completo. La primera confirmación introduce los
cuatro vectores obligatorios y deja las dependencias en versión vulnerable; la segunda
los remedia. El pipeline DevSecOps queda en **rojo** sobre la primera y en **verde**
sobre la segunda.

| Commit | Estado | Pipeline |
|---|---|---|
| `audit: variante vulnerable...` | vulnerable | ROJO (3/3 compuertas fallan) |
| `fix: remediacion de codigo y dependencias...` | remediado | VERDE (3/3 aprueban) |

## Vectores auditados

| ID | OWASP | Endpoint | Estado |
|---|---|---|---|
| A03 | A03:2021 Inyección SQL | `GET /api/articles-search` | remediado (consulta parametrizada) |
| A01 | A01:2021 Broken Access Control | `GET /api/admin/users` | remediado (middleware RBAC) |
| API1 | API1:2023 BOLA / IDOR | `GET /api/members/:id` | remediado (validación de propiedad) |
| API2 | API2:2023 Broken Authentication | middleware JWT | remediado (HS256 fijo + exp) |

## Pipeline DevSecOps

`.github/workflows/devsecops.yml` con tres compuertas bloqueantes:

- **Gitleaks** — secretos en el código.
- **Semgrep** — SAST con reglas OWASP propias (`.semgrep/reglas-tf.yml`) más OWASP Top 10 y Node/JS.
- **Trivy** — SCA de dependencias por severidad HIGH/CRITICAL.

## Ejecución local

```bash
npm install
cp .env.example .env   # definir JWT_SECRET
npx prisma migrate dev
npm start              # API en http://localhost:3000
```

> La clave de firma JWT se carga solo desde `JWT_SECRET`. El arranque falla si no está definida.
