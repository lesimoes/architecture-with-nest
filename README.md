# Treta Bank

A banking application built with NestJS following Clean Architecture principles, CQRS pattern, and Domain-Driven Design (DDD).

## Architecture

This project follows **Hexagonal Architecture** (also known as Ports and Adapters) with a clear separation of concerns across multiple layers:

### Layer Structure

```
src/bank-account/
├── domain/              # Business logic and domain models
│   ├── value-objects/   # Immutable value objects (AccountId, AccountNumber, Balance, Money, Owner)
│   ├── factories/       # Domain object factories
│   └── back-account.ts # Domain aggregate root
├── application/         # Application services and use cases
│   ├── commands/        # CQRS command handlers
│   ├── ports/          # Application ports (interfaces)
│   └── bank-account.service.ts
├── infrastructure/      # External concerns implementation
│   ├── entities/       # TypeORM entities
│   ├── repositories/   # Repository implementations
│   └── mapper/         # Domain-Entity mappers
└── presenters/         # Presentation layer
    ├── dto/            # Data Transfer Objects
    └── http/           # HTTP controllers
```

### Key Architectural Principles

- **Dependency Inversion**: High-level modules depend on abstractions (ports), not concrete implementations
- **Separation of Concerns**: Each layer has a specific responsibility
- **Domain-Driven Design**: Business logic is encapsulated in the domain layer
- **CQRS**: Commands and Queries are separated for better scalability

For detailed information about Domain-Driven Design and Hexagonal Architecture concepts, see:

- [Architecture Documentation (English)](docs/architecture-en.md)
- [Documentação de Arquitetura (Português)](docs/architecture-pt-BR.md)

## Technologies

- **NestJS**: Progressive Node.js framework
- **TypeORM**: Object-Relational Mapping for PostgreSQL
- **PostgreSQL**: Relational database
- **@nestjs/cqrs**: CQRS implementation for NestJS

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Database

Start the PostgreSQL database using Docker Compose:

```bash
docker-compose up -d
```

This will start a PostgreSQL container with the following configuration:

- Host: `localhost`
- Port: `5432`
- Username: `admin`
- Password: `123456`
- Database: `treta-bank`

### 3. Run Migrations

Execute database migrations to create the necessary tables:

```bash
npm run migration:run
```

Or use the custom migrate script:

```bash
npm run migrate
```

### 4. Start the Application

For development:

```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`

For production:

```bash
npm run build
npm run start:prod
```

## Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot-reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint the codebase
- `npm run migration:generate` - Generate a new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert the last migration

## API Endpoints

### Create Bank Account

```http
POST /bank-accounts
Content-Type: application/json

{
  "ownerName": "John Doe",
  "ownerDocument": "12345678900"
}
```

## Project Structure

```
treta-bank/
├── src/
│   ├── bank-account/        # Bank account bounded context
│   ├── core/                # Core module (database configuration)
│   ├── app.module.ts        # Root application module
│   └── main.ts              # Application entry point
├── test/                    # E2E tests
├── scripts/                 # Utility scripts
├── data-source.ts           # TypeORM data source configuration
└── docker-compose.yml       # Docker Compose configuration
```
