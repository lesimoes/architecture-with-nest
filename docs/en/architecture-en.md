# Architecture and Concepts

This document details the Domain-Driven Design (DDD) and Hexagonal Architecture concepts used in this project.

## Domain-Driven Design (DDD)

Domain-Driven Design is a software development approach that focuses on modeling the business domain, placing business logic at the center of the application.

### Aggregates

An aggregate is a cluster of domain objects that are treated as a single unit. The aggregate has a root (Aggregate Root) that is the only entry point to access internal objects.

In this project, `BankAccount` is the aggregate root that encapsulates:

- **Identity**: Represented by `AccountId`
- **Account Number**: Represented by `AccountNumber`
- **Owner**: Represented by `Owner`
- **Balance**: Represented by `Balance`

The `BankAccount` ensures consistency of business rules, such as:

```typescript
deposit(money: Money): void {
  this.validateAmount(money.amount);
  this.balance = this.balance.add(money);
}

withdraw(money: Money): void {
  this.validateAmount(money.amount);
  if (this.balance.money.amount < money.amount) {
    throw new Error('Insufficient balance');
  }
  this.balance = this.balance.subtract(money);
}
```

### Value Objects

Value objects are immutable objects that represent domain concepts. They are identified by their value, not by a unique identity.

#### Value Object Characteristics:

1. **Immutability**: Once created, cannot be changed
2. **Value Equality**: Two objects are equal if their values are equal
3. **Self-Validation**: Validate their own data upon creation

#### Value Objects in the Project:

- **AccountId**: Unique account identifier
- **AccountNumber**: Bank account number
- **Money**: Represents money with value and currency
- **Balance**: Account balance, composed of Money
- **Owner**: Account owner with name and document

Example of `Money`:

```typescript
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'BRL',
  ) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!currency || currency.trim().length === 0) {
      throw new Error('Currency cannot be empty');
    }
  }

  add(money: Money): Money {
    if (this.currency !== money.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + money.amount, this.currency);
  }
}
```

### Factories

Factories are responsible for creating complex domain objects, ensuring they are created in a valid and consistent state.

The `BankAccountFactory` encapsulates the logic for creating a bank account:

```typescript
create(ownerName: string, ownerDocument: string): BankAccount {
  const owner = new Owner(ownerName, ownerDocument);
  const bankAccount = new BankAccount();
  bankAccount.id = new AccountId(randomUUID());
  bankAccount.number = new AccountNumber(
    Math.random().toString(36).substring(2, 15),
  );
  bankAccount.owner = owner;
  bankAccount.balance = new Balance(new Money(0, 'BRL'));
  return bankAccount;
}
```

### Bounded Contexts

A bounded context defines the boundaries where a specific domain model applies. In this project, `bank-account` is a bounded context that contains all logic related to bank accounts.

## Hexagonal Architecture

Hexagonal Architecture (also known as Ports and Adapters) isolates business logic from technical concerns, allowing the application to be independent of frameworks, databases, and external interfaces.

### Architecture Layers

#### 1. Domain Layer

The domain layer contains pure business logic, without external dependencies:

- **Domain Entities**: `BankAccount`
- **Value Objects**: `AccountId`, `AccountNumber`, `Balance`, `Money`, `Owner`
- **Factories**: `BankAccountFactory`
- **Business Rules**: Methods like `deposit()` and `withdraw()`

This layer knows nothing about persistence, HTTP, or any specific technology.

#### 2. Application Layer

The application layer orchestrates use cases and coordinates the domain:

- **Command Handlers**: Process CQRS commands (e.g., `CreateBankAccountCommandHandler`)
- **Application Services**: Coordinate operations (e.g., `BankAccountService`)
- **Ports**: Interfaces that define contracts (e.g., `CreateBankAccountRepository`)

Ports define what the application needs, but not how it will be implemented:

```typescript
export abstract class CreateBankAccountRepository {
  abstract save(bankAccount: BankAccount): Promise<BankAccount>;
}
```

#### 3. Infrastructure Layer

The infrastructure layer implements adapters that connect the application to the external world:

- **Repositories**: Concrete implementations of ports (e.g., `OrmCreateBankAccountRepository`)
- **Entities**: Persistence models (e.g., `BankAccountEntity`)
- **Mappers**: Convert between domain and persistence models

The adapter implements the port defined in the application layer:

```typescript
export class OrmCreateBankAccountRepository
  implements CreateBankAccountRepositoryPort
{
  async save(bankAccount: BankAccount): Promise<BankAccount> {
    const persistenceModel = BankAccountMapper.toPersistence(bankAccount);
    const newEntity = await this.bankAccountRepository.save(persistenceModel);
    return BankAccountMapper.toDomain(newEntity);
  }
}
```

#### 4. Presenters Layer

The presenters layer handles user interfaces:

- **Controllers**: HTTP endpoints (e.g., `BankAccountController`)
- **DTOs**: Data Transfer Objects (e.g., `CreateBankAccountDto`)

### Hexagonal Architecture Principles

#### Dependency Inversion

Dependencies point inward, from the outside to the center:

```
Infrastructure → Application → Domain
```

The infrastructure layer depends on interfaces (ports) defined in the application layer, not the other way around.

#### Ports and Adapters

- **Ports**: Interfaces that define contracts (in the application layer)
- **Adapters**: Concrete implementations (in the infrastructure layer)

#### Technology Independence

Business logic does not depend on:

- Frameworks (NestJS, TypeORM)
- Databases (PostgreSQL)
- Communication protocols (HTTP)
- External libraries

### Data Flow

1. **Input**: An HTTP controller receives a request
2. **DTO**: The controller converts the request to a DTO
3. **Command**: The DTO is converted to a Command
4. **Command Handler**: The handler processes the command using the domain
5. **Repository Port**: The handler uses the port to persist
6. **Repository Adapter**: The adapter implements persistence
7. **Mapper**: Converts between domain model and entity
8. **Output**: Returns the result to the controller

### Benefits

1. **Testability**: Business logic can be tested without external dependencies
2. **Maintainability**: Technology changes don't affect the domain
3. **Flexibility**: Easy to swap implementations (e.g., TypeORM to Prisma)
4. **Clarity**: Clear separation of responsibilities
5. **Scalability**: Easy to add new adapters (e.g., GraphQL, gRPC)

## Folder Structure

The folder structure reflects the architecture:

```
src/bank-account/
├── domain/              # Pure business logic
│   ├── value-objects/   # Value objects
│   ├── factories/       # Factories
│   └── back-account.ts # Aggregate root
├── application/         # Use cases and orchestration
│   ├── commands/        # CQRS command handlers
│   ├── ports/          # Interfaces (contracts)
│   └── bank-account.service.ts
├── infrastructure/      # Technical implementations
│   ├── entities/       # Persistence entities
│   ├── repositories/   # Repository implementations
│   └── mapper/         # Domain ↔ persistence converters
└── presenters/         # Interface with external world
    ├── dto/            # Data transfer objects
    └── http/           # HTTP controllers
```

## CQRS (Command Query Responsibility Segregation)

CQRS separates read operations (queries) from write operations (commands), allowing independent optimizations.

### Commands

Represent intentions to change system state:

- `CreateBankAccountCommand`: Intention to create an account
- Processed by Command Handlers
- May return data, but focus is on state change

### Command Handlers

Process commands and execute business logic:

```typescript
@CommandHandler(CreateBankAccountCommand)
export class CreateBankAccountCommandHandler {
  async execute(command: CreateBankAccountCommand) {
    const bankAccount = this.bankAccountFactory.create(
      command.ownerName,
      command.ownerDocument,
    );
    await this.createBankAccountRepository.save(bankAccount);
    return bankAccount;
  }
}
```

### Command Bus

The NestJS CQRS Command Bus automatically dispatches commands to their respective handlers.
