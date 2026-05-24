# Digital Wave CRM

Modern CRM and workflow automation prototype inspired by Twenty CRM, branded for Digital Wave.

## Features

- Professional Digital Wave landing page using the uploaded logo.
- Clerk-ready authentication controls for Google, GitHub, Apple, and email.
- Lemon Squeezy checkout URL placeholders for Pro and Organization plans.
- Workflow list with active, draft, archived filters.
- React Flow workflow builder with trigger, action, condition, delay, and form nodes.
- Express + MongoDB APIs for workflows, runs, version history, restore, and execution.

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in `VITE_CLERK_PUBLISHABLE_KEY`.
3. Replace Lemon Squeezy checkout URLs with your variant checkout links.
4. Set `MONGODB_URI`.
5. Run `npm install`.
6. Run `npm run dev`.

## Clerk CLI Checklist

Here's what I'll do to get you set up with Clerk when you are ready to run the interactive Clerk setup.

1. Install or update the Clerk CLI.
2. Set up Clerk in this project and link it to `app_3EBbTmFWNXybS4Vms0iD6ZZVGDn`.
3. Verify framework-specific routing if the project changes to Next.js.
4. Start your app with Clerk installed.

The project is Vite + React, so it uses `@clerk/clerk-react`. Configure Google, GitHub, Apple, and email providers inside the Clerk dashboard for the linked Clerk app.

## API Routes

- `POST /api/workflows`
- `GET /api/workflows`
- `GET /api/workflows/:id`
- `PATCH /api/workflows/:id`
- `DELETE /api/workflows/:id`
- `POST /api/workflows/:id/run`
- `GET /api/workflows/:id/runs`
- `GET /api/workflows/:id/versions`
- `POST /api/workflows/:id/restore/:versionId`
