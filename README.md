# La Granja S.A. — Gestión Porcina

Sistema full‑stack para gestionar porcinos, clientes y alimentaciones con historial, inventario, y módulo de reportes con exportación a PDF incorporando el logo de la granja.

---

## Demo
- Módulos principales:
  - CRUD de Porcinos con historial de alimentaciones y control de stock.
  - CRUD de Clientes con eliminación en cascada de porcinos asociados.
  - CRUD de Alimentaciones con stock y trazabilidad.
  - Reportes: Trazabilidad por alimento, Consumo por cliente y Consumo por alimentación, con exportación a PDF (logo, título, tablas y paginado).
- UI con tema propio (paleta verde/terracota) y header persistente con logo.

> Nota: si se requiere una demo publicada, agregar aquí la URL o instrucciones para ejecutar un build de producción y servirlo.

---

## Features
- Gestión completa:
  - Porcinos: alta, edición, borrado, historial de alimentaciones con snapshot “inmutable” (se conserva el nombre aunque se elimine el alimento original).
  - Clientes: eliminación en cascada (al borrar un cliente, se borran sus porcinos).
  - Alimentaciones: stock, registro de consumo, y devolución de stock al borrar registros del historial.
- Reportes operativos con PDF:
  - Trazabilidad por alimento.
  - Consumo por cliente (eventos, total lbs, nº porcinos).
  - Consumo por alimentación (eventos, total lbs, % del período).
- UX/UI:
  - Paleta de colores centralizada con CSS variables.
  - Header con logo y navegación persistente.
  - Botones compactos con iconos accesibles (➕ ✏️ 🗑️ 📜).
  - SweetAlert2 tematizado (confirmaciones, loaders).
- Robustez:
  - Manejo de errores consistente en backend (404/400/500).
  - Validaciones de frontend y backend.
  - Modo de consulta en reportes: Local (rápido) o Servidor (agregaciones en BD para grandes volúmenes).

---

## Installation steps
Guía desde cero. Se requieren:
- Node.js LTS (v18+ recomendado)
- npm o pnpm
- MongoDB en local (o Atlas). Para transacciones, habilitar replica set (opcional).

1) Clonar repositorio
´´´
git clone https://github.com/usuario/la-granja-porcina.git
cd la-granja-porcina
´´´
