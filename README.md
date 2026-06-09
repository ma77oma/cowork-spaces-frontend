# CoWork Spaces Frontend

Frontend Angular para consumir la API REST de `CoWork Spaces`.

## Stack

- Angular 19 standalone components
- TypeScript
- Angular Router
- HttpClient
- Reactive Forms
- RxJS
- Angular Signals
- SCSS

## Comandos principales

```bash
npm install
npm start
npm run build
npm test
```

## Comando Angular CLI usado para generar la base

```bash
ng new cowork-spaces-web --directory . --routing --style scss --standalone --ssr false --skip-git
```

## Environments

Archivo base: `src/environments/environment.ts`

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://localhost:5001'
};
```

Archivo de desarrollo: `src/environments/environment.development.ts`

Actualiza `apiBaseUrl` con la URL real del backend antes de ejecutar la app.

## Arquitectura

```text
src/app/
├── core/
│   ├── api/
│   ├── auth/
│   ├── guards/
│   ├── interceptors/
│   ├── layout/
│   ├── models/
│   ├── services/
│   └── utils/
├── features/
│   ├── auth/
│   ├── reports/
│   ├── reservations/
│   └── spaces/
├── shared/
│   └── ui/
├── app.config.ts
├── app.routes.ts
└── app.component.ts
```

## Decisiones principales

- `core/api/api-client.service.ts`: capa HTTP simple para centralizar `apiBaseUrl`.
- `core/auth/auth.service.ts`: sesión JWT en `localStorage`, señales para usuario actual y estado autenticado.
- `core/interceptors`: uno para `Bearer token` y otro para errores HTTP globales.
- `core/guards`: protección de rutas privadas y bloqueo de `/login` y `/register` si ya existe sesión válida.
- `core/layout/shell-layout.component.*`: shell autenticado con sidebar y topbar.
- `features/*/services`: servicios HTTP por feature.
- `features/*/pages`: páginas contenedoras.
- `features/*/components`: formularios y piezas presentacionales reutilizables.
- `shared/ui`: componentes visuales comunes como badges, loaders y alerts.

## Rutas disponibles

- `/login`
- `/register`
- `/spaces`
- `/spaces/new`
- `/spaces/:id`
- `/spaces/:id/edit`
- `/reservations/new`
- `/reservations/:id`
- `/reports`

## Cobertura funcional incluida

- Login y registro contra `/api/auth/login` y `/api/auth/register`
- Persistencia simple de JWT
- Logout y control de expiración
- Listado, detalle, alta, edición y eliminación de espacios
- Creación de reservas con preview de precio
- Detalle y cancelación de reservas
- Reportes por rango de fechas
- Estados de carga, vacío y error
- Manejo consistente de errores `400`, `401`, `403`, `404`, `409`, `500`

## Archivos clave

- `src/app/app.config.ts`
- `src/app/app.routes.ts`
- `src/app/core/auth/auth.service.ts`
- `src/app/core/interceptors/auth.interceptor.ts`
- `src/app/core/interceptors/error.interceptor.ts`
- `src/app/core/guards/auth.guard.ts`
- `src/app/core/layout/shell-layout.component.ts`
- `src/app/features/spaces/services/spaces.service.ts`
- `src/app/features/reservations/services/reservations.service.ts`
- `src/app/features/reports/services/reports.service.ts`

## Siguientes ajustes recomendados

- Conectar `apiBaseUrl` real del backend.
- Ajustar formato monetario y zona horaria según despliegue.
- Añadir paginación o filtros si el volumen de espacios crece.
- Ampliar tests de componentes y servicios según reglas del negocio.
