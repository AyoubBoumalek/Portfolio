# QA Automation Portfolio

A Next.js App Router portfolio with a protected admin dashboard, Prisma ORM, and Prisma Postgres.

## Local development

1. Install dependencies with `npm install`.
2. Link the repository to the Vercel `portfolio-qa` project with `vercel link`.
3. Pull the Preview database environment into the ignored `.env` file with `vercel env pull .env --environment=preview`.
4. Run `npm run dev`.

The Prisma client uses `DATABASE_URL_POOLED` when present. Prisma migrations use the direct `DATABASE_URL`.

## Database and deployments

The Prisma schema targets PostgreSQL. The Vercel build command runs `prisma migrate deploy`, seeds only missing default content, and then builds Next.js. The seed is safe to rerun: existing profile and project edits are preserved.

The Prisma Postgres integration must be connected to the Vercel project for Preview and Production, with `DATABASE_URL` and `DATABASE_URL_POOLED` set in both environments.

## Admin dashboard

Visit `/admin/login` to sign in. From `/admin`, update profile details, manage project cards and skills, and review anonymous traffic and portfolio interaction analytics.
