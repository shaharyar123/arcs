/**
 * @license
 * Copyright (c) 2019 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {Comparable, compareStrings, compareNumbers} from '../recipe/comparable.js';
import {Type} from '../type.js';
import {StorageKey} from './storage-key.js';
import {Consumer} from '../hot.js';
import {StorageStub} from '../storage-stub.js';
import {assert} from '../../platform/assert-web.js';
import {Store as OldStore} from '../store.js';
import {PropagatedException} from '../arc-exceptions.js';
import {ProxyCallback} from './store.js';

/**
 * This is a temporary interface used to unify old-style stores (storage/StorageProviderBase) and new-style stores (storageNG/Store).
 * We should be able to remove this once we've switched across to the NG stack.
 *
 * Note that for old-style stores, StorageStubs are used *sometimes* to represent storage which isn't activated. For new-style stores,
 * Store itself represents an inactive store, and needs to be activated using activate(). This will present some integration
 * challenges :)
 *
 * Note also that old-style stores use strings for Storage Keys, while NG storage uses storageNG/StorageKey subclasses. This provides
 * a simple test for determining whether a store is old or new.
 *
 * Common functionality between old- and new-style stores goes in this class.
 * Once the old-style stores are deleted, this class can be merged into the new
 * Store class.
 */
export abstract class UnifiedStore implements Comparable<UnifiedStore>, OldStore {
  // Tags for all subclasses of UnifiedStore.
  protected abstract unifiedStoreType: 'Store' | 'StorageStub' | 'StorageProviderBase';

  abstract id: string;
  abstract name: string;
  abstract type: Type;
  // TODO: Once the old storage stack is gone, this should only be of type StorageKey.
  abstract storageKey: string | StorageKey;
  abstract version?: number; // TODO(shans): This needs to be a version vector for new storage.
  abstract referenceMode: boolean;

  abstract toString(tags?: string[]): string; // TODO(shans): This shouldn't be called toString as toString doesn't take arguments.

  abstract activate(): Promise<UnifiedActiveStore>;

  // TODO: These properties/methods do not belong on UnifiedStore. They should
  // probably go on some other abstraction like UnifiedActiveStore or similar.
  abstract source?: string;
  abstract description: string;

  /**
   * Hack to cast this UnifiedStore to the old-style class StorageStub.
   * TODO: Fix all usages of this method to handle new-style stores, and then
   * delete.
   */
  castToStorageStub(): StorageStub {
    // Can't use instanceof; causes circular dependencies.
    assert(this.unifiedStoreType === 'StorageStub', 'Not a StorageStub!');
    return this as unknown as StorageStub;
  }

  // TODO: Delete this method when the old-style storage is deleted.
  reportExceptionInHost(exception: PropagatedException): void {
    // This class lives in the host, so it's safe to just rethrow the exception.
    throw exception;
  }

  _compareTo(other: UnifiedStore): number {
    let cmp: number;
    cmp = compareStrings(this.name, other.name);
    if (cmp !== 0) return cmp;
    cmp = compareNumbers(this.version, other.version);
    if (cmp !== 0) return cmp;
    cmp = compareStrings(this.source, other.source);
    if (cmp !== 0) return cmp;
    cmp = compareStrings(this.id, other.id);
    if (cmp !== 0) return cmp;
    return 0;
  }
}

export interface UnifiedActiveStore {
  /** The UnifiedStore instance from which this store was activated. */
  readonly baseStore: UnifiedStore;

  // TODO(shans): toLiteral is currently used in _serializeStore, during recipe serialization. It's used when volatile
  // stores need to be written out as resources into the manifest. Problem is, it expects a particular CRDT model shape;
  // for new storage we probably need to extract the model from the store instead and have the CRDT directly produce a
  // JSON representation for insertion into the serialization.
  // tslint:disable-next-line no-any
  toLiteral(): Promise<any>;

  cloneFrom(store: UnifiedActiveStore): Promise<void>;
  modelForSynchronization(): Promise<{}>;

  // TODO: Make this match the type of the `on` method in ActiveStore.
  on(callback: ProxyCallback<null>): number;
  off(callback: number): void;
}
