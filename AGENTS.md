# Repository Guidelines

## Project Structure & Module Organization
- Next.js App Router lives in `app/`, with `layout.tsx` wiring shared UI and `page.tsx` as the default route. Treat each route as a folder that owns its components.
- Global styles import Tailwind CSS v4 in `app/globals.css`; add theme tokens there instead of duplicating colors.
- Static assets (images, icons, fonts) belong in `public/` and are referenced via absolute paths (`/logo.svg`).
- Tooling lives at the repo root: `eslint.config.mjs`, `tsconfig.json`, and PostCSS/Tailwind configs govern every package, so keep overrides local to avoid drift.

## Build, Test, and Development Commands
- `npm run dev` — start the Next.js dev server on `localhost:3000` with hot reload; use for day-to-day work.
- `npm run build` — create the production bundle; always run before opening a PR that touches routing or config.
- `npm run start` — serve the last production build; use when verifying deployment artifacts.
- `npm run lint` — run ESLint with the Next.js + Core Web Vitals presets; required before committing.

## Coding Style & Naming Conventions
- TypeScript is required; colocate UI helpers next to their routes and prefer server components unless client interactivity is unavoidable.
- Follow the ESLint config at `eslint.config.mjs`; fix warnings immediately, not later.
- Use 2-space indentation, PascalCase for components (`HeroSection`), camelCase for helpers, and kebab-case for file names unless Next.js routing dictates otherwise.
- Keep CSS tokens in `@theme inline` and favor semantic class names over arbitrary hex values.

## Testing Guidelines
- A formal test suite is not present yet; for new features, add either Playwright E2E or React Testing Library specs under `app/__tests__/` and wire them into `npm test`.
- Describe edge cases in PRs until automated coverage exists, and treat `npm run lint && npm run build` as the minimum regression gate.

## Commit & Pull Request Guidelines
- Git history mixes terse English and Japanese messages; converge on the Conventional Commits pattern (`feat(home): add hero copy`) in imperative mood.
- Each PR must include: purpose summary, screenshots for UI-facing work, reproduction/validation steps, and linked GitHub issue or task.
- Rebase on `main`, ensure zero lint errors, and mention any config or Env var changes explicitly so reviewers can update deploy environments.

## Overview
- The project's objective is to create a new application with functionality similar to the existing web application's webclass, featuring a refined UI and other improvements.

## Maintenance policy
- Consider incorporating points repeatedly emphasized during discussions
- Review sections that may be redundant or have room for compression
- Aim for concise yet dense documentation
- Respond in Japanese