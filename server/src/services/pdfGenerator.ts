import PDFDocument from 'pdfkit';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, win32, posix } from 'path';

const ROOT = join(import.meta.dirname, '..', '..', '..');
const SRC = join(ROOT, 'src');
const SERVER_SRC = join(ROOT, 'server', 'src');
const IGNORE = new Set(['node_modules', '.git', 'dist', '.vite']);

function getAllFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      if (IGNORE.has(entry)) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        files.push(...getAllFiles(full));
      } else if (full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.css')) {
        files.push(full);
      }
    }
  } catch { /* skip unreadable */ }
  return files;
}

function escapeText(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const FILE_EXPLANATIONS: Record<string, string> = {
  // ── Server ──
  'server/src/index.ts': 'Application entry point. Configures Express with middleware (CORS, Helmet security headers, rate limiting, MongoDB sanitization, HPP protection, JSON parsing). Registers health check, workflow, and AI route groups. Attempts MongoDB connection and starts the HTTP server.',
  'server/src/middleware/security.ts': 'Security middleware layer. Provides CSP headers, HSTS, rate limiting via express-rate-limit, NoSQL injection sanitization, HTTP parameter pollution protection, request body validation, and a global error handler with structured JSON responses.',
  'server/src/routes/aiRoutes.ts': 'AI chat endpoint. POST /api/ai/ask accepts a prompt and optional CRM context. Validates input length and API key presence. Calls OpenAI GPT-4o-mini with a CRM assistant system prompt. Returns the AI answer or a helpful fallback message.',
  'server/src/routes/workflowRoutes.ts': 'Workflow REST API route definitions. Maps CRUD operations (POST/GET/PATCH/DELETE /api/workflows), workflow execution (POST /:id/run), run history (GET /:id/runs), version management (GET /:id/versions), and version restoration (POST /:id/restore/:versionId) to their controller handlers.',
  'server/src/controllers/workflowController.ts': 'Workflow controller logic. Implements create, list, get, update, delete (soft-archive), run, listRuns, listVersions, and restoreVersion operations. Each workflow update creates a version snapshot. Runs execute via the workflow engine and record logs/errors/status.',
  'server/src/services/workflowEngine.ts': 'Workflow execution engine. Implements DAG-based execution with topological node ordering via DFS traversal. Supports Trigger, Condition, Delay, Form, and generic Action node kinds. Returns structured ExecutionResult with status, logs, and error messages.',
  'server/src/services/pdfGenerator.ts': 'PDF documentation generator. Reads all project source files (.ts, .tsx, .css) from both src/ and server/src/. Uses pdfkit to produce a professionally formatted A4 PDF with a title page, table of contents, categorized file sections with explanations and code excerpts, and an architecture overview page. Each section includes a human-readable explanation of the file purpose, role, and key components followed by the actual source code.',
  'server/src/routes/docsRoutes.ts': 'Documentation download route. Serves GET /api/docs/download which triggers the pdfGenerator to build a complete code documentation PDF on demand. Sets Content-Type to application/pdf and Content-Disposition to attachment for browser download.',
  'server/src/models/Workflow.ts': 'Mongoose schema for workflows. Fields: name, description, status (active/draft/archived), nodes, edges, version (auto-incremented), createdBy, runs counter. Includes timestamps for createdAt/updatedAt.',
  'server/src/models/WorkflowRun.ts': 'Mongoose schema for workflow execution runs. Fields: workflowId (ref to Workflow), status (running/success/failed), logs array, inputData, errorMessages, startedAt, finishedAt. Tracks each execution attempt.',
  'server/src/models/WorkflowVersion.ts': 'Mongoose schema for workflow version snapshots. Fields: workflowId, versionNumber, and snapshot (full workflow object). Enables rollback to any previous version.',

  // ── Client Core ──
  'src/App.tsx': 'Root React component. Wraps the application in ClerkProvider (authentication), ThemeProvider (dark/light mode), and Toaster (notifications). Routes between the public LandingPage and the authenticated CRM shell (AppShell with AuthRequired guard).',
  'src/main.tsx': 'Vite entry point. Imports React StrictMode, the App component, and global styles. Mounts the application to the DOM root element.',
  'src/styles.css': 'Global stylesheet. Imports Tailwind base/components/utilities. Defines CSS custom properties (variables) for the neutral dark theme palette. Styles the CRM shell layout, sidebar, tables, buttons, modals, dropdowns, and scrollbars. Overrides Clerk components to match the dark theme.',
  'src/vite-env.d.ts': 'Vite environment type declarations. References Vite client types for import.meta.env and other Vite-specific features.',

  // ── Components: App / Landing ──
  'src/components/AppShell.tsx': 'Main application shell layout. Composes the DigitalWaveSidebar navigation with a flex-1 content area that renders the active module (DigitalWaveCrmApp). Provides the structural frame for the entire CRM interface.',
  'src/components/crm/AuthRequired.tsx': 'Authentication guard component. Wraps child content and uses Clerk useUser() to check authentication status. Shows a loading spinner while auth state is resolving. Renders children only when a user is authenticated.',
  'src/components/landing/LandingPage.tsx': 'Full public landing page. Composes Navbar, HeroSection, and LandingSections into a complete marketing page with a dark blue (#050816) gradient background. Includes a footer and a Sign In button linking to the CRM.',
  'src/components/landing/HeroSection.tsx': 'Landing page hero banner. Displays the product headline, descriptive subtitle, and two CTA buttons (Get Started / Learn More) with gradient styling and hover animations.',
  'src/components/landing/Navbar.tsx': 'Landing page top navigation bar. Contains the Digital Wave logo, navigation links (Features, About, Contact, Pricing), and a Sign In button. Sticky positioned with glass-morphism effect.',
  'src/components/landing/LandingSections.tsx': 'Additional landing page content sections. Includes Features grid, About section, Pricing tiers, and Contact form. Each section has consistent dark-themed styling with gradient accents.',

  // ── Components: Digital Wave (CRM) ──
  'src/components/digital-wave/DigitalWaveCrmApp.tsx': 'Core CRM application component. Manages state arrays for all 9 entity types (Companies, People, Tasks, Notes, Opportunities, Deals, Leads, Meetings, Projects). Defines entityConfigs mapping with field definitions, empty object generators, and item converters. Implements CRUD operations: add, edit, delete, duplicate for all entities. Routes between 11 modules: Companies (CompanyTable), AI Execute (AiExecutePanel), AI Ask (AiAssistantPanel), Workflows (WorkflowDashboard), Settings (SettingsPanel), and others (DigitalWaveModulePanel with CRUD). Includes CrudModal rendering for create/edit, and a delete confirmation modal.',
  'src/components/digital-wave/DigitalWaveSidebar.tsx': 'CRM sidebar navigation. Uses flex-col layout with scrollable nav section and pinned bottom section. Lists all 11 module links with Lucide icons, active state highlighting, and click handlers. Includes ThemeToggle and LogoutButton at the bottom.',
  'src/components/digital-wave/DigitalWaveModulePanel.tsx': 'Generic module panel. Accepts dynamic items prop, a title, and an entity type identifier. Renders a responsive table with columns auto-generated from the first item\u2019s keys. Supports add/edit/delete actions. Falls back to placeholder content for modules without data.',
  'src/components/digital-wave/CompanyTable.tsx': 'Companies data table. Features a search/filter bar, configurable grid columns, and action menus per row. Supports inline editing via CrudModal, row deletion with confirmation, and company duplication. Displays company name, industry, contact, email, phone, status, owner, and actions.',
  'src/components/digital-wave/CrudModal.tsx': 'Reusable CRUD form modal. Dynamically renders form fields based on a field config array supporting types: text, email, tel, number, date, textarea, select. Handles validation, loading state with spinner, error display, and controlled value changes. Closes on Escape key and click-outside.',
  'src/components/digital-wave/TableActions.tsx': 'Table row action dropdown. Uses fixed positioning with getBoundingClientRect() for reliable placement. Detects viewport edges and flips to left side when right space is insufficient. Provides Edit, Duplicate, Delete, and View actions with themed hover states. Z-index 50 for stacking above table content.',
  'src/components/digital-wave/QuickActions.tsx': 'Horizontal quick action bar. Displays Person, Task, and Note quick-add buttons. Each button opens QuickAddModal with the appropriate form type. Provides rapid data entry without navigating away from the current view.',
  'src/components/digital-wave/QuickAddModal.tsx': 'Quick-add modal for rapid entity creation. Renders type-specific forms for Person (name, title, company, email, phone), Task (title, priority, dueDate, status), and Note (title, content, category). Validates required fields and calls the parent add handler.',
  'src/components/digital-wave/SettingsPanel.tsx': 'Full settings interface. Left sidebar with 15 category navigation (Profile, Appearance, Notifications, Security, AI, Workflows, Integrations, Account, Billing, Team, API, Data, Privacy, About, Shortcuts). Right content area with live forms including: Profile (name, email, phone, role, timezone, language, bio), Appearance (theme toggle, compact mode, sidebar style, density, font size, accent color picker), Notifications (7 toggle switches), Security (password change with show/hide, 2FA toggle, active sessions), AI Settings (execution/assistant toggles, model/response style selects), Workflow Settings (enabled toggle, max executions, retry policy, logging toggle), Integrations (8 services with connect/disconnect buttons). Save/Reset buttons with loading state and success feedback. Settings persisted via localStorage. Includes LogoutButton at the bottom of the sidebar.',
  'src/components/digital-wave/AiAssistantPanel.tsx': 'AI assistant chat interface. Premium UI with word-by-word typing animation, 5 quick prompt buttons (Recommendations, Analytics, Summarize, Compare, Recent). Renders user/assistant message bubbles with avatars, loading state spinner, and smooth auto-scroll. Communicates with the server /api/ai/ask endpoint.',
  'src/components/digital-wave/AiExecutePanel.tsx': 'AI command execution panel. Terminal-inspired UI with monospace font and $ prompt prefix. 6 quick command buttons for common operations. Shows execution loading state and result cards with success (green) / failure (red) color coding. Includes confirm-delete workflow.',
  'src/components/digital-wave/DigitalWaveChatPanel.tsx': 'Internal chat/messaging panel. Provides a conversation interface within the CRM for team communication. Supports message sending and display.',
  'src/components/digital-wave/DigitalWaveCommandMenu.tsx': 'Command palette / quick actions menu. Keyboard shortcut-driven interface (Cmd+K) for rapid navigation and actions. Lists available commands with fuzzy search filtering.',
  'src/components/digital-wave/ThemeToggle.tsx': 'Theme toggle button. Cycles between dark, light, and system theme modes. Uses the ThemeContext to update CSS custom properties and persist the preference.',
  'src/components/digital-wave/LogoutButton.tsx': 'Logout component with safety confirmation. Uses Clerk useClerk().signOut() for real session invalidation. Shows a confirmation modal with AlertTriangle icon and Cancel/Logout buttons. Displays loading spinner with "Logging out..." text during sign-out. Danger red hover styling (#f87171). Cleans up localStorage keys (crm-settings, crm-selected-ids, crm-view-mode, theme). Redirects to / via window.location.href after completion. Supports 3 variants: sidebar, settings, and icon-only.',
  'src/components/digital-wave/WorkflowDashboard.tsx': 'Workflow management dashboard. Lists all workflows with status badges, run counts, and version numbers. Provides Create, Edit (inline form), Run (with execution), Duplicate, and Delete (with confirmation) actions. Displays run history and version timeline for each workflow.',

  // ── Components: UI ──
  'src/components/ui/Badge.tsx': 'Reusable badge component. Renders a styled label with configurable variant (default, success, warning, error, info) and size. Used throughout the CRM for status indicators.',
  'src/components/ui/Button.tsx': 'Reusable button component. Supports variants (primary, secondary, ghost, danger), sizes (sm, md, lg), loading state with spinner, disabled state, and icon positioning. Base for all interactive elements in the CRM.',
  'src/components/ui/Card.tsx': 'Reusable card container. Provides consistent padding, border radius, background color, and shadow. Used as the base wrapper for tables, panels, and content sections throughout the CRM.',
  'src/components/ui/CommandPalette.tsx': 'Generic command palette component. Renders a searchable list of commands with keyboard navigation. Supports categories, icons, and action callbacks. Used as the base for DigitalWaveCommandMenu.',
  'src/components/ui/Input.tsx': 'Reusable form input component. Supports text, email, password, number, and textarea types with labels, error messages, placeholder text, and consistent theming.',
  'src/components/ui/Modal.tsx': 'Generic modal dialog component. Supports overlay backdrop, close-on-escape, close-on-click-outside, configurable title, body, and footer sections. Used as the base for CrudModal and LogoutButton confirmation.',
  'src/components/ui/Skeleton.tsx': 'Loading skeleton placeholder component. Renders animated pulse rectangles for content that is still loading. Used across the CRM for a smooth loading experience.',
  'src/components/ui/Toast.tsx': 'Toast notification component (wrapper around sonner). Provides success, error, warning, and info toast variants with auto-dismiss and positioning configuration.',

  // ── Workflow Builder ──
  'src/components/workflows/WorkflowBuilder.tsx': 'Visual workflow builder using React Flow (reactflow). Provides a drag-and-drop node editor for creating automation workflows. Supports Trigger, Condition, Action, Delay, and Form node types with configurable properties. Includes zoom, pan, mini-map, and connection validation.',
  'src/pages/WorkflowPage.tsx': 'Workflow builder page. Wraps the WorkflowBuilder component in a full-page layout with save/load controls. Provides the entry point for creating and editing individual workflows.',

  // ── Services ──
  'src/services/settingsService.ts': 'Settings persistence service. Defines the Settings interface with 6 categories (Profile, Appearance, Notifications, Security, AI, Workflows, Integrations) plus sub-types for each. Implements load/save/reset functions using localStorage under the crm-settings key. Provides complete default settings for a fresh user.',
  'src/services/aiAssistantEngine.ts': 'AI assistant engine. Client-side logic for managing chat state, sending prompts to the server endpoint, and processing responses. Handles conversation history and error recovery.',
  'src/services/aiExecutionEngine.ts': 'AI execution engine. Client-side logic for interpreting natural language commands, mapping them to CRM actions, executing those actions, and returning structured results.',
  'src/services/workflowEngine.ts': 'Client-side workflow execution engine. Mirrors the server engine structure for local workflow validation and dry-run capabilities. Parses workflow definitions and simulates execution paths.',

  // ── Hooks & Stores ──
  'src/hooks/useAutoSave.ts': 'Auto-save hook. Provides debounced persistence for form data. Accepts a save function and delay parameter. Automatically triggers save after user input stops changing.',
  'src/hooks/useKeyboard.ts': 'Keyboard shortcut hook. Registers global and scoped keyboard event listeners. Supports modifier keys (Ctrl, Cmd, Shift, Alt) and dynamic enable/disable. Powers the command palette and quick actions.',
  'src/hooks/useWorkflow.ts': 'Workflow state hook. Manages the current workflow being edited, including nodes, edges, name, description, and status. Provides add/update/remove node and edge operations.',
  'src/stores/workflowStore.ts': 'Zustand state store for workflow management. Holds the list of workflows, current workflow, and run history. Provides actions for CRUD operations, execution, and version management with Zustand subscribe/notify pattern.',

  // ── Library & Types ──
  'src/lib/api.ts': 'API client module. Provides typed fetch wrapper functions for all server endpoints: health check, workflow CRUD, workflow run, workflow versions, AI ask. Handles request serialization, error handling, and response parsing.',
  'src/lib/types.ts': 'Core TypeScript type definitions. Defines Workflow, WorkflowNode, WorkflowEdge, WorkflowRun, WorkflowVersion, and API response types. Provides shared types used by both the client and server code.',
  'src/types/index.ts': 'CRM entity type definitions. Defines TypeScript interfaces for CrmPerson, CrmTask, CrmNote, CrmOpportunity, CrmDeal, CrmLead, CrmMeeting, CrmProject, and CrmCompany. Includes all fields used across the CRUD system.',
  'src/constants/data.ts': 'Seed data and constants. Provides initial entity data for all 8 entity types, sidebar navigation items with icons and labels, and default CRM configuration values. Used for demo/presentation purposes.',
  'src/constants/design.ts': 'Design system constants. Defines shared color values, spacing scales, breakpoints, z-index layers, and animation durations used across the CRM for consistent visual design.',
  'src/contexts/ThemeContext.tsx': 'React context provider for theme management. Detects system color scheme preference via matchMedia, persists user choice to localStorage under the theme key, and applies dark/light class to the document root element. Provides toggleTheme and resolvedTheme to consumers.',
  'src/utils/cn.ts': 'Class name utility function. Combines and deduplicates CSS class names. Uses a simple string join pattern to conditionally apply Tailwind classes throughout the application.',
};

export async function generateCodeDocumentationPDF(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
      info: {
        Title: 'Digital Wave CRM - Complete Code Documentation',
        Author: 'Digital Wave',
        Subject: 'Full source code documentation and explanations',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const YELLOW = '#f59e0b';
    const BLUE = '#3b82f6';
    const GRAY = '#6b7280';
    const DARK = '#1f2937';

    function title(text: string, size = 28) {
      doc.fontSize(size).font('Helvetica-Bold').fillColor(YELLOW).text(text, { align: 'center' });
    }

    function heading(text: string, size = 16) {
      doc.fontSize(size).font('Helvetica-Bold').fillColor(YELLOW).text(text, { continued: false });
    }

    function body(text: string) {
      doc.fontSize(9).font('Helvetica').fillColor('#374151').text(text, { align: 'justify' });
    }

    function codeBlock(code: string) {
      doc.fontSize(7).font('Courier').fillColor('#1e293b');
      const lines = code.split('\n').filter((l, i, a) => i < 80 || i > a.length - 10);
      if (code.split('\n').length > 90) {
        doc.text('[File truncated - showing first 80 lines]', { indent: 10 });
      }
      doc.text(lines.join('\n'), { indent: 10, align: 'left' });
    }

    function separator() {
      doc.moveDown(0.5).strokeColor('#d1d5db').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown(0.5);
    }

    function checkPage() {
      if (doc.y > 720) {
        doc.addPage();
      }
    }

    // ── Cover Page ──
    doc.rect(0, 0, 595, 842).fill('#0f172a');
    doc.fillColor('#ffffff');
    doc.fontSize(36).font('Helvetica-Bold').text('Digital Wave CRM', { align: 'center', y: 200 });
    doc.fontSize(24).fillColor(YELLOW).text('Complete Code Documentation', { align: 'center' });
    doc.fontSize(12).fillColor('#94a3b8').text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center', y: 280 });
    doc.fontSize(10).fillColor('#64748b').text('This document explains every file in the project - server and client -', { align: 'center', y: 310 });
    doc.text('including architecture, component roles, and data flow.', { align: 'center' });

    doc.addPage();
    doc.fillColor('#0f172a').rect(0, 0, 595, 842).fill();
    doc.fillColor('#ffffff');
    heading('Table of Contents', 22);
    doc.moveDown(1);
    const tocSections = [
      'Server Side (API, Routes, Controllers, Models)',
      'Client Core (App, Main, Styles, Types)',
      'Landing Page Components',
      'CRM Components (Digital Wave)',
      'UI Components',
      'Workflow Builder',
      'Services',
      'Hooks, Stores, and Utilities',
      'Configuration and Types',
    ];
    doc.fontSize(11).font('Helvetica');
    tocSections.forEach((s, i) => {
      doc.fillColor(YELLOW).text(`${i + 1}. ${s}`);
      doc.moveDown(0.3);
    });

    // ── Collect Files ──
    const clientFiles = getAllFiles(SRC);
    const serverFiles = getAllFiles(SERVER_SRC);
    const allFiles = [...serverFiles, ...clientFiles].sort();

    // ── Categorize ──
    const categories: { title: string; files: string[] }[] = [
      { title: '1. Server - Entry Point', files: [] },
      { title: '2. Server - Middleware & Security', files: [] },
      { title: '3. Server - Routes', files: [] },
      { title: '4. Server - Controllers', files: [] },
      { title: '5. Server - Models', files: [] },
      { title: '6. Server - Services', files: [] },
      { title: '7. Client - Core', files: [] },
      { title: '8. Client - Landing Page', files: [] },
      { title: '9. Client - CRM Components (Digital Wave)', files: [] },
      { title: '10. Client - UI Components', files: [] },
      { title: '11. Client - Workflow Builder', files: [] },
      { title: '12. Client - Services', files: [] },
      { title: '13. Client - Hooks', files: [] },
      { title: '14. Client - Stores', files: [] },
      { title: '15. Client - Library & Types', files: [] },
      { title: '16. Client - Constants & Context', files: [] },
      { title: '17. Client - Utilities', files: [] },
    ];

    const catMap: Record<string, number> = {
      'server/src/index.ts': 0,
      'server/src/middleware/security.ts': 1,
      'server/src/routes/aiRoutes.ts': 2,
      'server/src/routes/workflowRoutes.ts': 2,
      'server/src/routes/docsRoutes.ts': 2,
      'server/src/controllers/workflowController.ts': 3,
      'server/src/models/Workflow.ts': 4,
      'server/src/models/WorkflowRun.ts': 4,
      'server/src/models/WorkflowVersion.ts': 4,
      'server/src/services/workflowEngine.ts': 5,
      'server/src/services/pdfGenerator.ts': 5,
      'src/App.tsx': 6,
      'src/main.tsx': 6,
      'src/styles.css': 6,
      'src/vite-env.d.ts': 6,
      'src/components/landing/LandingPage.tsx': 7,
      'src/components/landing/HeroSection.tsx': 7,
      'src/components/landing/Navbar.tsx': 7,
      'src/components/landing/LandingSections.tsx': 7,
      'src/components/digital-wave/DigitalWaveCrmApp.tsx': 8,
      'src/components/digital-wave/DigitalWaveSidebar.tsx': 8,
      'src/components/digital-wave/DigitalWaveModulePanel.tsx': 8,
      'src/components/digital-wave/CompanyTable.tsx': 8,
      'src/components/digital-wave/CrudModal.tsx': 8,
      'src/components/digital-wave/TableActions.tsx': 8,
      'src/components/digital-wave/QuickActions.tsx': 8,
      'src/components/digital-wave/QuickAddModal.tsx': 8,
      'src/components/digital-wave/SettingsPanel.tsx': 8,
      'src/components/digital-wave/AiAssistantPanel.tsx': 8,
      'src/components/digital-wave/AiExecutePanel.tsx': 8,
      'src/components/digital-wave/DigitalWaveChatPanel.tsx': 8,
      'src/components/digital-wave/DigitalWaveCommandMenu.tsx': 8,
      'src/components/digital-wave/ThemeToggle.tsx': 8,
      'src/components/digital-wave/LogoutButton.tsx': 8,
      'src/components/digital-wave/WorkflowDashboard.tsx': 8,
      'src/components/AppShell.tsx': 8,
      'src/components/crm/AuthRequired.tsx': 8,
      'src/components/ui/Badge.tsx': 9,
      'src/components/ui/Button.tsx': 9,
      'src/components/ui/Card.tsx': 9,
      'src/components/ui/CommandPalette.tsx': 9,
      'src/components/ui/Input.tsx': 9,
      'src/components/ui/Modal.tsx': 9,
      'src/components/ui/Skeleton.tsx': 9,
      'src/components/ui/Toast.tsx': 9,
      'src/components/workflows/WorkflowBuilder.tsx': 10,
      'src/pages/WorkflowPage.tsx': 10,
      'src/services/settingsService.ts': 11,
      'src/services/aiAssistantEngine.ts': 11,
      'src/services/aiExecutionEngine.ts': 11,
      'src/services/workflowEngine.ts': 11,
      'src/hooks/useAutoSave.ts': 12,
      'src/hooks/useKeyboard.ts': 12,
      'src/hooks/useWorkflow.ts': 12,
      'src/stores/workflowStore.ts': 13,
      'src/lib/api.ts': 14,
      'src/lib/types.ts': 14,
      'src/types/index.ts': 14,
      'src/constants/data.ts': 15,
      'src/constants/design.ts': 15,
      'src/contexts/ThemeContext.tsx': 15,
      'src/utils/cn.ts': 16,
    };

    for (const f of allFiles) {
      const rel = relative(ROOT, f).replace(/\\/g, '/');
      const idx = catMap[rel];
      if (idx !== undefined) categories[idx].files.push(rel);
    }

    // ── Render Each File ──
    for (const cat of categories) {
      if (cat.files.length === 0) continue;
      checkPage();
      doc.addPage();
      doc.fillColor('#0f172a').rect(0, 0, 595, 842).fill();
      doc.fillColor('#ffffff');
      heading(cat.title, 18);
      doc.moveDown(0.5);
      separator();

      for (const relPath of cat.files) {
        checkPage();
        doc.fillColor('#ffffff');
        doc.fontSize(11).font('Helvetica-Bold').fillColor(YELLOW).text(relPath);
        doc.moveDown(0.3);

        const explanation = FILE_EXPLANATIONS[relPath];
        if (explanation) {
          doc.fontSize(9).font('Helvetica-Oblique').fillColor('#94a3b8').text(explanation);
          doc.moveDown(0.3);
        }

        const fullPath = join(ROOT, relPath.replace(/\//g, '\\'));
        if (existsSync(fullPath)) {
          try {
            let content = readFileSync(fullPath, 'utf-8');
            if (content.length > 4000) {
              content = content.slice(0, 4000) + '\n\n// ... (truncated for PDF length)';
            }
            doc.fontSize(7).font('Courier').fillColor('#e2e8f0');
            doc.text(escapeText(content), { indent: 10, width: 495 });
          } catch { /* skip unreadable */ }
        }
        separator();
      }
    }

    // ── Architecture Overview Page ──
    doc.addPage();
    doc.fillColor('#0f172a').rect(0, 0, 595, 842).fill();
    doc.fillColor('#ffffff');
    heading('Architecture Overview', 20);
    doc.moveDown(0.5);
    body('Digital Wave CRM is a full-stack web application built with React 18 + TypeScript on the frontend and Express.js + MongoDB (Mongoose) on the backend. The application uses Vite as the build tool and Tailwind CSS for styling.');
    doc.moveDown(0.5);
    body('Frontend Architecture: The React application follows a component-based architecture with clear separation of concerns. The App component provides authentication (Clerk) and theming context. The AppShell renders the sidebar navigation alongside the active CRM module. Each module (Companies, People, Tasks, etc.) is rendered by the DigitalWaveCrmApp routing system, which manages CRUD state for all 9 entity types through a generic entityConfigs pattern.');
    doc.moveDown(0.5);
    body('Backend Architecture: The Express server uses a layered architecture: routes define endpoints, controllers handle request/response logic, services implement business logic (workflow engine, AI integration), and Mongoose models define data schemas. Security is enforced through multiple middleware layers (CSP, CORS, rate limiting, NoSQL injection protection).');
    doc.moveDown(0.5);
    body('The AI system uses two separate panels: the Assistant provides conversational Q&A via OpenAI GPT-4o-mini, while Execute interprets natural language commands and performs CRM actions. Both have premium UIs with typing animations and quick prompts.');
    doc.moveDown(0.5);
    body('The workflow system implements a DAG-based execution engine. Users build visual workflows using React Flow, which are saved to MongoDB and executed on demand. Each update creates a version snapshot for rollback capability.');
    doc.moveDown(0.5);
    body('The settings system uses localStorage persistence with 15 categories covering profile, appearance, notifications, security, AI preferences, workflows, and integrations. The theme system supports dark, light, and system-follow modes through CSS custom properties.');

    // ── Footer ──
    doc.addPage();
    doc.fillColor('#0f172a').rect(0, 0, 595, 842).fill();
    doc.fillColor('#ffffff');
    title('End of Documentation', 22);
    doc.moveDown(1);
    doc.fontSize(10).fillColor('#94a3b8').text(`Total files documented: ${allFiles.length}`, { align: 'center' });
    doc.text(`Generated by Digital Wave CRM - ${new Date().toLocaleDateString()}`, { align: 'center' });

    doc.end();
  });
}
