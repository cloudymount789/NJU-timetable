# NJU-timetable

Monorepo architecture (phase A):

- `app/mobile`: React Native + Expo + TypeScript application scaffold
- `packages/contracts`: shared entities and DTO contracts
- `packages/domain`: pure business rules and use-cases
- `services/bff`: optional backend-for-frontend contract scaffold

Design and requirement sources:

- `docs/requirements document.md`
- `docs/frontend-functional-spec.md`
- `docs/monorepo-architecture-blueprint.md`
- `notes/`

Quick start (after dependency install):

- `npm run dev:mobile`
- `npm run typecheck`