# Folder Structure Documentation

This document describes the folder structure of the SIM95 project and follows Next.js and React best practices.

## Project Structure Overview

```
sim95/
├── .github/                    # GitHub configuration
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   ├── workflows/             # CI/CD workflows
│   ├── dependabot.yml        # Dependency updates automation
│   └── pull_request_template.md
├── app/                        # Next.js App Router
│   ├── api/                   # API route handlers
│   │   ├── assessment-definitions/
│   │   ├── assessment-instances/
│   │   ├── score/
│   │   ├── scoring-versions/
│   │   └── seed/
│   ├── admin/                 # Admin dashboard pages
│   ├── analytics/             # Analytics pages
│   ├── assessment/            # Assessment taking pages
│   ├── auth/                  # Authentication pages
│   ├── dashboard/             # User dashboard
│   ├── login/                 # Login page
│   ├── profile/               # User profile
│   ├── report/                # Report viewing pages
│   ├── globals.css            # Global styles (Tailwind + custom)
│   ├── layout.tsx             # Root layout
│   ├── middleware.ts          # Next.js middleware
│   └── page.tsx               # Home page
├── components/                 # React components
│   ├── ui/                    # Reusable UI components (shadcn/ui)
│   └── figma/                 # Figma-related components
├── contexts/                   # React Context providers
│   ├── AssessmentContext.tsx
│   └── AuthContext.tsx
├── lib/                        # Core library code
│   ├── db/                    # Database query functions
│   ├── scoring/               # Scoring engine implementation
│   ├── supabase/              # Supabase client utilities
│   └── utils.ts               # Utility functions (cn helper)
├── public/                     # Static assets
├── tests/                      # Test files
│   ├── __tests__/             # Jest tests
│   ├── data/                  # Test data
│   ├── helpers/               # Test utilities
│   └── *.spec.ts              # E2E tests (Playwright)
├── types/                      # TypeScript type definitions
│   └── assessment.ts
├── utils/                      # Utility functions
│   └── scoringEngine.ts       # Scoring engine (alternative implementation)
└── [config files]             # Configuration files
```

## Folder Organization Principles

### `/app` - Next.js App Router
- Contains all pages and API routes
- Uses Next.js 13+ App Router conventions
- Each route is a folder with `page.tsx` or `route.ts`

### `/components` - React Components
- Reusable UI components
- Organized by feature or type
- `/components/ui` contains shadcn/ui components

### `/lib` - Core Business Logic
- Database queries (`lib/db/`)
- Scoring engine (`lib/scoring/`)
- Supabase utilities (`lib/supabase/`)
- Shared utilities (`lib/utils.ts`)

### `/contexts` - React Context
- Global state management
- Authentication context
- Assessment context

### `/tests` - Testing
- Unit tests in `__tests__/`
- Integration tests in `__tests__/integration/`
- E2E tests using Playwright
- Test helpers and utilities

### `/types` - TypeScript Types
- Shared type definitions
- Assessment-related types

### `/utils` - Utility Functions
- General-purpose utility functions
- Note: There's some overlap with `/lib/utils.ts` - consider consolidation

## Notes and Recommendations

### 🔄 Potential Consolidation
- `utils/scoringEngine.ts` and `lib/scoring/` both contain scoring logic. The `utils/scoringEngine.ts` is used by `AssessmentContext.tsx`, while `lib/scoring/` appears to be a more comprehensive implementation. Consider consolidating these in the future.

### ✅ Best Practices Followed
- Separation of concerns
- Clear folder naming conventions
- Next.js App Router structure
- Organized component hierarchy
- Proper test organization

## Configuration Files

- `.nvmrc` - Node version specification (Node 20)
- `.prettierrc.json` - Code formatting rules
- `.prettierignore` - Files to exclude from formatting
- `.editorconfig` - Editor consistency settings
- `.gitignore` - Git ignore patterns (Next.js optimized)
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `jest.config.js` - Jest test configuration
- `playwright.config.ts` - Playwright E2E test configuration
- `components.json` - shadcn/ui configuration

