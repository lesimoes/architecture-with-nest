const VERSION = Symbol('version');
import { AggregateRoot } from '@nestjs/cqrs';
import { Version } from './value-objects/version';

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
