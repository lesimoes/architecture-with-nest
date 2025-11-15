# Arquitetura e Conceitos

Este documento detalha os conceitos de Domain-Driven Design (DDD) e Arquitetura Hexagonal utilizados neste projeto.

## Domain-Driven Design (DDD)

Domain-Driven Design é uma abordagem de desenvolvimento de software que foca na modelagem do domínio do negócio, colocando a lógica de negócio no centro da aplicação.

### Agregados (Aggregates)

Um agregado é um cluster de objetos de domínio que são tratados como uma unidade única. O agregado tem uma raiz (Aggregate Root) que é o único ponto de entrada para acessar os objetos internos.

No projeto, `BankAccount` é o agregado raiz que encapsula:

- **Identidade**: Representada pelo `AccountId`
- **Número da Conta**: Representado pelo `AccountNumber`
- **Proprietário**: Representado pelo `Owner`
- **Saldo**: Representado pelo `Balance`

O `BankAccount` garante a consistência das regras de negócio, como:

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

### Objetos de Valor (Value Objects)

Objetos de valor são objetos imutáveis que representam conceitos do domínio. Eles são identificados pelo seu valor, não por uma identidade única.

#### Características dos Value Objects:

1. **Imutabilidade**: Uma vez criado, não pode ser alterado
2. **Igualdade por Valor**: Dois objetos são iguais se seus valores forem iguais
3. **Validação**: Validam seus próprios dados na criação

#### Value Objects no Projeto:

- **AccountId**: Identificador único da conta
- **AccountNumber**: Número da conta bancária
- **Money**: Representa dinheiro com valor e moeda
- **Balance**: Saldo da conta, composto por Money
- **Owner**: Proprietário da conta com nome e documento

Exemplo de `Money`:

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

### Fábricas (Factories)

Fábricas são responsáveis por criar objetos de domínio complexos, garantindo que sejam criados em um estado válido e consistente.

A `BankAccountFactory` encapsula a lógica de criação de uma conta bancária:

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

### Contextos Delimitados (Bounded Contexts)

Um contexto delimitado define os limites onde um modelo de domínio específico se aplica. No projeto, `bank-account` é um contexto delimitado que contém toda a lógica relacionada a contas bancárias.

## Arquitetura Hexagonal

A Arquitetura Hexagonal (também conhecida como Ports and Adapters) isola a lógica de negócio das preocupações técnicas, permitindo que a aplicação seja independente de frameworks, bancos de dados e interfaces externas.

### Camadas da Arquitetura

#### 1. Domain (Domínio)

A camada de domínio contém a lógica de negócio pura, sem dependências externas:

- **Entidades de Domínio**: `BankAccount`
- **Value Objects**: `AccountId`, `AccountNumber`, `Balance`, `Money`, `Owner`
- **Fábricas**: `BankAccountFactory`
- **Regras de Negócio**: Métodos como `deposit()` e `withdraw()`

Esta camada não conhece nada sobre persistência, HTTP ou qualquer tecnologia específica.

#### 2. Application (Aplicação)

A camada de aplicação orquestra os casos de uso e coordena o domínio:

- **Command Handlers**: Processam comandos CQRS (ex: `CreateBankAccountCommandHandler`)
- **Application Services**: Coordenam operações (ex: `BankAccountService`)
- **Ports**: Interfaces que definem contratos (ex: `CreateBankAccountRepository`)

Os ports definem o que a aplicação precisa, mas não como será implementado:

```typescript
export abstract class CreateBankAccountRepository {
  abstract save(bankAccount: BankAccount): Promise<BankAccount>;
}
```

#### 3. Infrastructure (Infraestrutura)

A camada de infraestrutura implementa os adapters (adaptadores) que conectam a aplicação ao mundo externo:

- **Repositories**: Implementações concretas dos ports (ex: `OrmCreateBankAccountRepository`)
- **Entities**: Modelos de persistência (ex: `BankAccountEntity`)
- **Mappers**: Convertem entre modelos de domínio e persistência

O adapter implementa o port definido na camada de aplicação:

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

#### 4. Presenters (Apresentação)

A camada de apresentação lida com a interface do usuário:

- **Controllers**: Endpoints HTTP (ex: `BankAccountController`)
- **DTOs**: Objetos de transferência de dados (ex: `CreateBankAccountDto`)

### Princípios da Arquitetura Hexagonal

#### Inversão de Dependência

As dependências apontam para dentro, do exterior para o centro:

```
Infrastructure → Application → Domain
```

A camada de infraestrutura depende das interfaces (ports) definidas na camada de aplicação, não o contrário.

#### Ports e Adapters

- **Ports**: Interfaces que definem contratos (na camada de aplicação)
- **Adapters**: Implementações concretas (na camada de infraestrutura)

#### Independência de Tecnologia

A lógica de negócio não depende de:

- Frameworks (NestJS, TypeORM)
- Bancos de dados (PostgreSQL)
- Protocolos de comunicação (HTTP)
- Bibliotecas externas

### Fluxo de Dados

1. **Entrada**: Um controller HTTP recebe uma requisição
2. **DTO**: O controller converte a requisição em DTO
3. **Command**: O DTO é convertido em um Command
4. **Command Handler**: O handler processa o comando usando o domínio
5. **Repository Port**: O handler usa o port para persistir
6. **Repository Adapter**: O adapter implementa a persistência
7. **Mapper**: Converte entre modelo de domínio e entidade
8. **Saída**: Retorna o resultado ao controller

### Benefícios

1. **Testabilidade**: Lógica de negócio pode ser testada sem dependências externas
2. **Manutenibilidade**: Mudanças em tecnologias não afetam o domínio
3. **Flexibilidade**: Fácil trocar implementações (ex: trocar TypeORM por Prisma)
4. **Clareza**: Separação clara de responsabilidades
5. **Escalabilidade**: Facilita adicionar novos adapters (ex: GraphQL, gRPC)

## Estrutura de Pastas

A estrutura de pastas reflete a arquitetura:

```
src/bank-account/
├── domain/              # Lógica de negócio pura
│   ├── value-objects/   # Objetos de valor
│   ├── factories/       # Fábricas
│   └── back-account.ts # Agregado raiz
├── application/         # Casos de uso e orquestração
│   ├── commands/        # Handlers de comandos CQRS
│   ├── ports/          # Interfaces (contratos)
│   └── bank-account.service.ts
├── infrastructure/      # Implementações técnicas
│   ├── entities/       # Entidades de persistência
│   ├── repositories/   # Implementações de repositórios
│   └── mapper/         # Conversores domínio ↔ persistência
└── presenters/         # Interface com o mundo externo
    ├── dto/            # Objetos de transferência
    └── http/           # Controllers HTTP
```

## CQRS (Command Query Responsibility Segregation)

CQRS separa operações de leitura (queries) de operações de escrita (commands), permitindo otimizações independentes.

### Commands (Comandos)

Representam intenções de mudar o estado do sistema:

- `CreateBankAccountCommand`: Intenção de criar uma conta
- Processados por Command Handlers
- Podem retornar dados, mas o foco é a mudança de estado

### Command Handlers

Processam comandos e executam a lógica de negócio:

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

O Command Bus do NestJS CQRS despacha comandos para seus respectivos handlers automaticamente.
