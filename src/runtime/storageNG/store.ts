/**
 * @license
 * Copyright (c) 2019 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {CRDTModel, CRDTTypeRecord} from '../crdt/crdt.js';
import {Type} from '../type.js';
import {Exists} from './drivers/driver-factory.js';
import {StorageKey} from './storage-key.js';
import {StoreInterface, StorageMode, ActiveStore, ProxyMessageType, ProxyMessage, ProxyCallback, StorageCommunicationEndpoint, StorageCommunicationEndpointProvider} from './store-interface.js';
import {DirectStore} from './direct-store.js';
import {ReferenceModeStore, ReferenceModeStorageKey} from './reference-mode-store.js';
import {UnifiedStore} from './unified-store.js';

export {
  ActiveStore,
  ProxyCallback,
  ProxyMessage,
  ProxyMessageType,
  StorageCommunicationEndpoint,
  StorageCommunicationEndpointProvider,
  StorageMode
};

type StoreConstructor = {
  construct<T extends CRDTTypeRecord>(
      storageKey: StorageKey,
      exists: Exists,
      type: Type,
      mode: StorageMode,
      baseStore: Store<T>): Promise<ActiveStore<T>>;
};

// A representation of a store. Note that initially a constructed store will be
// inactive - it will not connect to a driver, will not accept connections from
// StorageProxy objects, and no data will be read or written.
//
// Calling 'activate()' will generate an interactive store and return it.
export class Store<T extends CRDTTypeRecord> extends UnifiedStore implements StoreInterface<T> {
  protected unifiedStoreType: 'Store' = 'Store';

  toString(tags: string[]): string {
    throw new Error('Method not implemented.');
  }

  source: string;
  description: string;
  readonly storageKey: StorageKey;
  exists: Exists;
  readonly type: Type;
  readonly mode: StorageMode;
  readonly id: string;
  readonly name: string;
  readonly version: number = 0; // TODO(shans): Needs to become the version vector, and is also probably only available on activated storage?
  modelConstructor: new () => CRDTModel<T>;

  private activeStore: ActiveStore<T> | null;

  static readonly constructors = new Map<StorageMode, StoreConstructor>([
    [StorageMode.Direct, DirectStore],
    [StorageMode.ReferenceMode, ReferenceModeStore as StoreConstructor]
  ]);

  constructor(storageKey: StorageKey, exists: Exists, type: Type, id: string, name: string = '') {
    super();
    this.storageKey = storageKey;
    this.exists = exists;
    this.type = type;
    this.mode = storageKey instanceof ReferenceModeStorageKey ? StorageMode.ReferenceMode : StorageMode.Direct;
    this.id = id;
    this.name = name;
  }

  async activate(): Promise<ActiveStore<T>> {
    if (this.activeStore) {
      return this.activeStore;
    }

    if (Store.constructors.get(this.mode) == null) {
      throw new Error(`StorageMode ${this.mode} not yet implemented`);
    }
    const constructor = Store.constructors.get(this.mode);
    if (constructor == null) {
      throw new Error(`No constructor registered for mode ${this.mode}`);
    }
    const activeStore = await constructor.construct<T>(this.storageKey, this.exists, this.type, this.mode, this);
    this.exists = Exists.ShouldExist;
    this.activeStore = activeStore;
    return activeStore;
  }

  // TODO(shans): DELETEME once we've switched to this storage stack
  get referenceMode() {
    return this.mode === StorageMode.ReferenceMode;
  }
}
