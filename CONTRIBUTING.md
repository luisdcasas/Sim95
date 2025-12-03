# Contributing to SIM95

Thank you for your interest in contributing to SIM95! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sim95
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

### Formatting Code

```bash
# Format all files
npx prettier --write "**/*.{js,jsx,ts,tsx,json,css,md}"

# Check formatting
npm run lint
```

## Project Structure

```
sim95/
├── app/                    # Next.js app router pages and API routes
│   ├── api/               # API route handlers
│   ├── admin/             # Admin dashboard pages
│   └── ...
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   └── ...
├── contexts/             # React context providers
├── lib/                  # Core library code
│   ├── db/              # Database query functions
│   ├── scoring/         # Scoring engine implementation
│   └── supabase/        # Supabase client utilities
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── tests/                # Test files
│   ├── __tests__/       # Jest unit and integration tests
│   └── helpers/         # Test utilities
└── public/               # Static assets
```

## Testing

### Run Tests

```bash
# Run all tests
npm run test:all

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Writing Tests

- Unit tests should be in `tests/__tests__/`
- Integration tests should test API routes and database interactions
- E2E tests use Playwright and should be in `tests/`

## Git Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, descriptive commit messages
   - Keep commits focused and atomic

3. **Test your changes**
   - Ensure all tests pass
   - Test manually if needed

4. **Submit a Pull Request**
   - Use the PR template
   - Describe your changes clearly
   - Link any related issues

## Commit Message Guidelines

- Use clear, descriptive messages
- Start with a verb in imperative mood (e.g., "Add", "Fix", "Update")
- Keep the first line under 72 characters
- Add more details in the body if needed

Examples:
- `Add user authentication middleware`
- `Fix scoring calculation for hidden variables`
- `Update README with setup instructions`

## Pull Request Process

1. Update the README.md if needed
2. Add tests for new functionality
3. Ensure all CI checks pass
4. Get at least one code review approval
5. Merge after approval

## Code Review Guidelines

- Be respectful and constructive
- Focus on code quality and maintainability
- Ask questions rather than making demands
- Appreciate good work!

## Questions?

Feel free to open an issue for questions or discussions.

