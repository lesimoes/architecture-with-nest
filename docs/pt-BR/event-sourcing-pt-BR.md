# Event Sourcing

Event Sourcing é um padrão arquitetural onde o estado da aplicação é determinado pela sequência de eventos que ocorreram, ao invés de armazenar apenas o estado atual. Cada mudança de estado é registrada como um evento imutável no Event Store.

## Conceitos Fundamentais

### Event Store

O Event Store é o repositório persistente onde todos os eventos são armazenados de forma sequencial e imutável. Cada evento contém:

- **streamId**: Identificador do agregado que gerou o evento
- **type**: Tipo do evento (ex: `DepositMadeEvent`, `WithdrawMadeEvent`)
- **position**: Posição sequencial do evento no stream
- **data**: Dados serializados do evento

No projeto, o Event Store é implementado usando MongoDB:

```typescript
@Schema()
export class Event {
  @Prop()
  streamId: string;

  @Prop()
  type: string;

  @Prop()
  position: number;

  @Prop({ type: SchemaTypes.Mixed })
  data: Record<string, any>;
}
```

### Versioned Aggregate Root

O agregado raiz estende `VersionedAggregateRoot`, que adiciona controle de versão para garantir consistência otimista:

```typescript
export class VersionedAggregateRoot extends AggregateRoot {
  public versionedId: string;
  private [VERSION] = new Version(0);

  get version(): Version {
    return this[VERSION];
  }

  setVersion(version: Version): void {
    this[VERSION] = version;
  }
}
```

A versão é usada para detectar conflitos de concorrência ao persistir eventos, garantindo que o agregado não esteja desatualizado.

### Eventos de Domínio

Eventos de domínio representam algo que aconteceu no sistema e são imutáveis. No projeto, os eventos são definidos na camada de domínio:

```typescript
export class DepositMadeEvent {
  constructor(
    public readonly accountId: string,
    public readonly amount: Money,
    public readonly balance: number,
  ) {}
}

export class WithdrawMadeEvent {
  constructor(
    public readonly accountId: string,
    public readonly amount: Money,
    public readonly balance: number,
  ) {}
}
```

## Aplicação de Eventos

Os eventos são aplicados no agregado através do método `apply()` do NestJS CQRS, mas com a flag `skipHandler: true` para evitar processamento imediato:

```typescript
deposit(money: Money): void {
  this.validateAmount(money.amount);
  this.balance = this.balance.add(money);
  this.versionedId = this.id.id;
  this.apply(
    new DepositMadeEvent(this.id.id, money, this.balance.money.amount),
    { skipHandler: true },
  );
}
```

## Persistência de Eventos

### Event Store Publisher

O `EventStorePublisher` implementa `IEventPublisher` do NestJS CQRS e intercepta todos os eventos publicados, persistindo-os no Event Store:

```typescript
@Injectable()
export class EventStorePublisher implements IEventPublisher {
  publish<T extends IEvent = IEvent>(
    event: T,
    dispatcher: VersionedAggregateRoot,
  ) {
    const serializableEvent = this.eventSerializer.serialize(event, dispatcher);
    return this.eventStore.persist(serializableEvent);
  }

  publishAll<T extends IEvent = IEvent>(
    events: T[],
    dispatcher: VersionedAggregateRoot,
  ) {
    const serializableEvents = events
      .map((event) => this.eventSerializer.serialize(event, dispatcher))
      .map((serializableEvent, index) => ({
        ...serializableEvent,
        position: dispatcher.version.value + index + 1,
      }));

    return this.eventStore.persist(serializableEvents);
  }
}
```

### Serialização de Eventos

O `EventSerializer` converte eventos de domínio em formato serializável para persistência:

```typescript
serialize<T>(
  event: T,
  dispatcher: VersionedAggregateRoot,
): SerializableEvent<T> {
  const eventType = event?.constructor?.name as string;
  const aggregateId = dispatcher.versionedId;
  return {
    streamId: aggregateId,
    position: dispatcher.version.value + 1,
    type: eventType,
    data: this.toJSON(event),
  };
}
```

### Mongo Event Store

O `MongoEventStore` é responsável pela persistência física dos eventos no MongoDB, utilizando transações para garantir atomicidade:

```typescript
async persist(
  eventOrEvents: SerializableEvent | SerializableEvent[],
): Promise<void> {
  const events = Array.isArray(eventOrEvents)
    ? eventOrEvents
    : [eventOrEvents];

  const session = await this.eventStore.startSession();
  try {
    session.startTransaction();
    await this.eventStore.insertMany(events, { session, ordered: true });
    await session.commitTransaction();
  } catch (error: any) {
    await session.abortTransaction();
    const UNIQUE_CONSTRAINT_ERROR_CODE = 11000;
    if (error?.code === UNIQUE_CONSTRAINT_ERROR_CODE) {
      throw new Error('Events could not be persisted. Aggregate is stale.');
    }
    throw error;
  } finally {
    await session.endSession();
  }
}
```

O índice único em `{ streamId: 1, position: 1 }` garante que não haja duplicação de eventos e detecta conflitos de versão.

## Recuperação de Estado

Para recuperar o estado atual de um agregado, o repositório consulta a versão mais recente no Event Store:

```typescript
async findByNumber(accountNumber: AccountNumber): Promise<BankAccount | null> {
  const entity = await this.bankAccountRepository.findOne({
    where: { number: accountNumber.number },
  });

  if (!entity) {
    return null;
  }

  const bankAccount = BankAccountMapper.toDomain(entity);
  const lastVersion = await this.eventStore.getLastVersion(
    bankAccount.versionedId,
  );
  bankAccount.setVersion(new Version(lastVersion));

  return bankAccount;
}
```

## Fluxo Completo

1. **Command Handler** recebe um comando (ex: `MakeDepositCommand`)
2. **Repository** recupera o agregado do banco de dados e consulta a versão no Event Store
3. **Event Publisher** é mesclado ao contexto do agregado usando `mergeObjectContext()`
4. **Método do Domínio** (ex: `deposit()`) aplica o evento com `skipHandler: true`
5. **Commit** do agregado dispara a publicação dos eventos
6. **Event Store Publisher** intercepta e serializa os eventos
7. **Mongo Event Store** persiste os eventos em uma transação
8. **Repository** atualiza o estado atual do agregado no banco de dados

## Benefícios

1. **Auditoria Completa**: Histórico completo de todas as mudanças de estado
2. **Replay de Eventos**: Possibilidade de reconstruir o estado em qualquer ponto no tempo
3. **Desacoplamento**: Eventos podem ser consumidos por múltiplos handlers sem acoplamento
4. **Time Travel**: Capacidade de visualizar o estado do sistema em qualquer momento histórico
5. **Consistência Otimista**: Controle de versão previne conflitos de concorrência

## Estrutura no Projeto

```
src/shared/
├── domain/
│   ├── aggregate-root.ts          # VersionedAggregateRoot
│   ├── value-objects/
│   │   └── version.ts              # Value Object para versão
│   └── interfaces/
│       └── serializable-event.ts   # Interface para eventos serializáveis
└── infrastructure/
    └── event-store/
        ├── mongo-event-store.ts    # Implementação do Event Store
        ├── publisher/
        │   └── event-store.publisher.ts  # Publisher customizado
        ├── serializers/
        │   └── event.serializer.ts        # Serialização de eventos
        └── schemas/
            └── event.schema.ts            # Schema MongoDB
```
