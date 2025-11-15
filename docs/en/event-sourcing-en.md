# Event Sourcing

Event Sourcing is an architectural pattern where the application state is determined by the sequence of events that occurred, rather than storing only the current state. Each state change is recorded as an immutable event in the Event Store.

## Fundamental Concepts

### Event Store

The Event Store is the persistent repository where all events are stored sequentially and immutably. Each event contains:

- **streamId**: Identifier of the aggregate that generated the event
- **type**: Event type (e.g., `DepositMadeEvent`, `WithdrawMadeEvent`)
- **position**: Sequential position of the event in the stream
- **data**: Serialized event data

In this project, the Event Store is implemented using MongoDB:

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

The aggregate root extends `VersionedAggregateRoot`, which adds version control to ensure optimistic consistency:

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

The version is used to detect concurrency conflicts when persisting events, ensuring the aggregate is not stale.

### Domain Events

Domain events represent something that happened in the system and are immutable. In this project, events are defined in the domain layer:

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

## Event Application

Events are applied to the aggregate through the NestJS CQRS `apply()` method, but with the `skipHandler: true` flag to avoid immediate processing:

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

## Event Persistence

### Event Store Publisher

The `EventStorePublisher` implements `IEventPublisher` from NestJS CQRS and intercepts all published events, persisting them in the Event Store:

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

### Event Serialization

The `EventSerializer` converts domain events into a serializable format for persistence:

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

The `MongoEventStore` is responsible for the physical persistence of events in MongoDB, using transactions to ensure atomicity:

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

The unique index on `{ streamId: 1, position: 1 }` ensures there is no event duplication and detects version conflicts.

## State Recovery

To recover the current state of an aggregate, the repository queries the latest version in the Event Store:

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

## Complete Flow

1. **Command Handler** receives a command (e.g., `MakeDepositCommand`)
2. **Repository** retrieves the aggregate from the database and queries the version in the Event Store
3. **Event Publisher** is merged into the aggregate context using `mergeObjectContext()`
4. **Domain Method** (e.g., `deposit()`) applies the event with `skipHandler: true`
5. **Commit** of the aggregate triggers event publication
6. **Event Store Publisher** intercepts and serializes events
7. **Mongo Event Store** persists events in a transaction
8. **Repository** updates the current state of the aggregate in the database

## Benefits

1. **Complete Audit Trail**: Complete history of all state changes
2. **Event Replay**: Ability to reconstruct state at any point in time
3. **Decoupling**: Events can be consumed by multiple handlers without coupling
4. **Time Travel**: Ability to view system state at any historical moment
5. **Optimistic Consistency**: Version control prevents concurrency conflicts

## Project Structure

```
src/shared/
├── domain/
│   ├── aggregate-root.ts          # VersionedAggregateRoot
│   ├── value-objects/
│   │   └── version.ts              # Version Value Object
│   └── interfaces/
│       └── serializable-event.ts   # Serializable event interface
└── infrastructure/
    └── event-store/
        ├── mongo-event-store.ts    # Event Store implementation
        ├── publisher/
        │   └── event-store.publisher.ts  # Custom publisher
        ├── serializers/
        │   └── event.serializer.ts        # Event serialization
        └── schemas/
            └── event.schema.ts            # MongoDB schema
```
