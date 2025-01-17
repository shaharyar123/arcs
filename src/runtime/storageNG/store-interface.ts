/**
 * @license
 * Copyright (c) 2019 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {PropagatedException} from '../arc-exceptions.js';
import {CRDTModel, CRDTTypeRecord} from '../crdt/crdt.js';
import {Type} from '../type.js';
import {Exists} from './drivers/driver-factory.js';
import {StorageKey} from './storage-key.js';
import {StorageProxy} from './storage-proxy.js';
import {UnifiedActiveStore} from './unified-store.js';
import {Store} from './store.js';

/**
 * This file exists to break a circular dependency between Store and the ActiveStore implementations.
 * Source code outside of the storageNG directory should not import this file directly; instead use
 * store.ts, which re-exports all the useful symbols.
 */

export enum StorageMode {Direct, Backing, ReferenceMode}

export enum ProxyMessageType {SyncRequest, ModelUpdate, Operations}

export type ProxyMessage<T extends CRDTTypeRecord> = {type: ProxyMessageType.SyncRequest, id?: number} |
  {type: ProxyMessageType.ModelUpdate, model: T['data'], id?: number} |
  {type: ProxyMessageType.Operations, operations: T['operation'][], id?: number};

export type ProxyCallback<T extends CRDTTypeRecord> = (message: ProxyMessage<T>) => Promise<boolean>;

export type StoreInterface<T extends CRDTTypeRecord> = {
  readonly storageKey: StorageKey;
  exists: Exists;
  readonly type: Type;
  readonly mode: StorageMode;
};

// Interface common to an ActiveStore and the PEC, used by the StorageProxy.
export interface StorageCommunicationEndpoint<T extends CRDTTypeRecord> {
  setCallback(callback: ProxyCallback<T>): void;
  reportExceptionInHost(exception: PropagatedException): void;
  onProxyMessage(message: ProxyMessage<T>): Promise<boolean>;
}

export interface StorageCommunicationEndpointProvider<T extends CRDTTypeRecord> {
  getStorageEndpoint(storageProxy: StorageProxy<T>): StorageCommunicationEndpoint<T>;
}

// A representation of an active store. Subclasses of this class provide specific
// behaviour as controlled by the provided StorageMode.
export abstract class ActiveStore<T extends CRDTTypeRecord>
    implements StoreInterface<T>, StorageCommunicationEndpointProvider<T>, UnifiedActiveStore {
  readonly storageKey: StorageKey;
  exists: Exists;
  readonly type: Type;
  readonly mode: StorageMode;
  readonly baseStore: Store<T>;

  // TODO: Lots of these params can be pulled from baseStore.
  constructor(storageKey: StorageKey, exists: Exists, type: Type, mode: StorageMode, baseStore: Store<T>) {
    this.storageKey = storageKey;
    this.exists = exists;
    this.type = type;
    this.mode = mode;
    this.baseStore = baseStore;
  }

  async idle() {
    return Promise.resolve();
  }

  // tslint:disable-next-line no-any
  async toLiteral(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async cloneFrom(store: UnifiedActiveStore): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async modelForSynchronization(): Promise<{}> {
    return this.toLiteral();
  }

  abstract on(callback: ProxyCallback<T>): number;
  abstract off(callback: number): void;
  abstract async onProxyMessage(message: ProxyMessage<T>): Promise<boolean>;
  abstract reportExceptionInHost(exception: PropagatedException): void;

  getStorageEndpoint() {
    const store = this;
    let id: number;
    return {
      async onProxyMessage(message: ProxyMessage<T>): Promise<boolean> {
        message.id = id!;
        return store.onProxyMessage(message);
      },

      setCallback(callback: ProxyCallback<T>) {
        id = store.on(callback);
      },
      reportExceptionInHost(exception: PropagatedException): void {
        store.reportExceptionInHost(exception);
      }
    };
  }
}
