# Repo Overview

- Name: EndiAgro Frontend (Vite + React)
- Root: c:\endiagro\falder\front
- Notable directories:
  - src/pages: páginas principais (Dashboard, Login, Tesouraria, etc.)
  - src/components: componentes reutilizáveis
  - src/contexts: contextos (AuthContext)
  - src/services: APIs e integrações

## Run & Build
- Dev: npm run dev
- Build: npm run build
- Preview: npm run preview

## Contrib Guidelines
- Preferir componentes funcionais e hooks
- Manter handlers e helpers próximos ao componente quando específicos
- Utilizar lucide-react para ícones

## Known Gaps
- NovoTesouraria.jsx depende de helpers/constantes não definidos (pgcMapping, formatCurrency, handlers inflow/outflow)
- Recomenda-se criação de utils para moeda e PGC (src/utils)