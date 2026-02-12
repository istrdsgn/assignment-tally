# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Survey analytics dashboard built with React 19, TypeScript, Vite 7, and Tailwind CSS v4. Displays interactive chart components for Multiple Choice, NPS, and CSAT survey question types.

## Commands

- `npm run dev` — Start dev server (port 5173)
- `npm run build` — TypeScript compile + Vite production build
- `npm run lint` — ESLint
- `npm run preview` — Preview production build

## Architecture

Single-page app with no routing or external state management. All state is local via `useState`.

**App.tsx** renders `TopHeader` + three `QuestionBlock` wrappers, each containing a chart component:
- `MultiplyResponse` — Multiple choice with 3 chart types (vertical bar, horizontal bar, donut)
- `NpsScore` — Net Promoter Score with overview (gauge + categories) and detailed views (histogram, stacked, trend)
- `CsatScore` — Customer Satisfaction with overview (star ratings + gauge) and detailed views (histogram, trend)

**Shared components:**
- `Dropdown<T>` — Generic typed dropdown with click-outside detection, used for date period and view mode filters
- `QuestionBlock` — Wrapper providing question title above each chart (defined in App.tsx)

## Styling

Tailwind CSS v4 using `@tailwindcss/vite` plugin. Custom theme tokens defined in `src/index.css` via `@theme`:

| Token | Value | Usage |
|-------|-------|-------|
| `title-primary` | #302E2A | Main headings |
| `title-secondary` | #444444 | Card titles, question titles |
| `text-secondary` | #73726C | Labels, inactive tabs |
| `text-caption` | #9E9D98 | Captions, footnotes |
| `brand-accent` | #1966CA | Primary blue, buttons |
| `border` | rgba(48,46,42,0.12) | Card borders |

Additional chart-specific colors are defined as constants within components (e.g., `#A52E9D` purple for CSAT, `#27A674` green for NPS promoters).

All charts are SVG-based with dynamic dimensions calculated from data. Interactive hover states use absolute-positioned tooltip components.

## TypeScript

Strict mode enabled with `noUnusedLocals` and `noUnusedParameters`. View/tab modes use union types (e.g., `type ChartType = "vertical" | "horizontal" | "donut"`).
