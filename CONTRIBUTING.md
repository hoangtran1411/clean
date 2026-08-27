# Contributing to Clean Architecture & React 19 Reference Stack

Thank you for your interest in contributing to this project! 🎉

This project is built to provide a modern, production-grade, educational reference architecture for **.NET 10 (Clean Architecture, ASP.NET Core Identity, JWT, Aspire, CQRS)** and **React 19 (Tailwind CSS v4, shadcn/ui, TanStack Query v5, Axios)**.

Contributions from developers of all skill levels are welcome!

---

## 📋 Table of Contents

1. [Code of Conduct](#-code-of-conduct)
2. [How Can I Contribute?](#-how-can-i-contribute)
3. [Development Environment Setup](#-development-environment-setup)
4. [Git Branching & Commit Guidelines](#-git-branching--commit-guidelines)
5. [Code Quality & Architecture Standards](#-code-quality--architecture-standards)
6. [Submitting a Pull Request](#-submitting-a-pull-request-pr)
7. [Community & Support](#-community--support)

---

## 🤝 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful, constructive, and collaborative in discussions, issues, and pull request reviews.

---

## 💡 How Can I Contribute?

- 🐛 **Report Bugs**: Open an issue detailing the bug, steps to reproduce, expected vs. actual behavior, and error logs / stack traces.
- 💡 **Suggest Features & Enhancements**: Propose new educational modules, patterns (e.g. Redis caching, Testcontainers, RabbitMQ/MassTransit), or UI improvements.
- 📖 **Improve Documentation**: Fix typos, add diagrams, or expand explanations in `docs-backend/` or `docs-frontend/`.
- 💻 **Submit Code / Pull Requests**: Fix an existing issue or implement an approved feature.

---

## 🛠 Development Environment Setup

### Prerequisites

- **.NET SDK**: `.NET 10.0+` ([Download .NET](https://dotnet.microsoft.com/download))
- **Node.js**: `v20.0+` (Recommended `v24+`) and `npm 10+` ([Download Node.js](https://nodejs.org/))
- **IDE**: Visual Studio 2022/2025, VS Code (with *C# Dev Kit* and *REST Client* extensions), or JetBrains Rider.

### 1. Clone the Repository

```powershell
git clone https://github.com/your-username/clean.git
cd clean
```

### 2. Run the Backend API

```powershell
# Option A: Run with .NET Aspire Orchestration & Dashboard
dotnet run --project src/CleanArch.AppHost

# Option B: Run Web API directly
dotnet run --project src/CleanArch.WebApi
```

Backend API will start at `http://localhost:5000` with the Scalar OpenAPI reference UI at `http://localhost:5000/scalar/v1`.

### 3. Run the Frontend Client

```powershell
cd client
npm install
npm run dev
```

Frontend client will start at `http://localhost:3000`.

---

## 🌿 Git Branching & Commit Guidelines

### Branch Naming

Create feature or bugfix branches from `main`:

- `feat/add-redis-distributed-cache`
- `fix/token-refresh-race-condition`
- `docs/expand-aspire-guide`
- `refactor/optimize-mediatr-handlers`

### Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

| Prefix | Description | Example |
| :--- | :--- | :--- |
| **`feat:`** | A new feature | `feat: add redis output cache store implementation` |
| **`fix:`** | A bug fix | `fix: resolve token expiry check in axiosClient` |
| **`docs:`** | Documentation changes | `docs: add module 20 for integration testing` |
| **`refactor:`** | Code change that neither fixes a bug nor adds a feature | `refactor: simplify product query handlers` |
| **`test:`** | Adding or correcting tests | `test: add unit tests for idempotency action filter` |
| **`chore:`** | Build tasks, package updates, or tooling configs | `chore: update packages in Directory.Build.props` |

---

## 📐 Code Quality & Architecture Standards

### Backend (.NET 10)

1. **Clean Architecture Boundaries**:
   - **`Domain`**: Pure C# entities, domain events, domain exceptions (0 external dependencies).
   - **`Application`**: MediatR Commands/Queries, FluentValidation, interfaces (Depends ONLY on `Domain`).
   - **`Infrastructure`**: EF Core, Identity, third-party services (Implements `Application` interfaces).
   - **`WebApi`**: Thin controllers, middleware, authorization filters.
2. **`.editorconfig` Compliance**:
   Run the formatter before committing:

   ```powershell
   dotnet format
   dotnet format --verify-no-changes
   ```

3. **Build & Warnings**:
   All projects must compile with **0 Errors and 0 Warnings**:

   ```powershell
   dotnet build
   ```

### Frontend (React 19 & TypeScript)

1. **TypeScript Strict Mode**: Avoid `any`. Use strongly-typed DTOs, generics, and discriminated unions.
2. **Server State**: Use **TanStack Query** (`useQuery`, `useMutation`) for server-side state. Do not duplicate server data in global state managers.
3. **shadcn/ui & Styling**: Use `cn()` from `@/lib/utils` for conditional and merged Tailwind CSS classes.
4. **Build Verification**:

   ```powershell
   cd client
   npm run build
   ```

---

## 🚀 Submitting a Pull Request (PR)

1. **Fork the repository** and create your branch from `main`.
2. **Implement your changes** following the code standards above.
3. **Verify builds**:
   - Backend: `dotnet build` & `dotnet test`
   - Frontend: `cd client && npm run build`
   - Code formatting: `dotnet format --verify-no-changes`
4. **Open a Pull Request** against the `main` branch with:
   - A clear title and summary of what was changed and why.
   - Screenshots / logs if applicable.
   - Any related issue numbers (e.g. `Closes #12`).

---

## 💬 Community & Support

- 🌟 **Star the repository** on GitHub if you find it helpful!
- 🐛 **Open an Issue** for questions, bug reports, or discussion.
- 📖 Read the curriculum in [`docs-backend/`](docs-backend/README.md) and [`docs-frontend/`](docs-frontend/README.md).

Thank you for helping make this reference stack better for the developer community! ❤️
