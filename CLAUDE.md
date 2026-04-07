@AGENTS.md

# Configurador 3D — Mundo Estanterías

Este proyecto genera un visor 3D paramétrico de estanterías metálicas usando React Three Fiber.

## LEER PRIMERO: SPECS.md
El archivo `SPECS.md` en la raíz tiene las especificaciones COMPLETAS y actualizadas:
- Shape exacto del `config` que recibe `Estanteria3D.jsx`
- Cómo funciona el parante variable (fino/grueso/industrial → tamaños distintos)
- Cómo funcionan los refuerzos por kg (0, 1 o 2 nervios debajo del estante)
- Specs completas de Estanrack para fase 2
- Cómo se integra al sitio real

## Reglas del componente
- El ancho es SIEMPRE 90cm. No parametrizar.
- NO agregar UI de controles, carrito, sidebar ni topbar. Eso ya existe en el sitio real. Solo el componente 3D.
- El componente debe exportar default y recibir un único prop `config`.
- La página `/test-estanterias` tiene controles replicados del sitio para probar.

## Stack
- Next.js + React Three Fiber + drei + three.js
- Tailwind CSS para la UI de test
