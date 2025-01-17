/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {assert} from '../platform/assert-web.js';

import {Description} from './description.js';
import {Manifest} from './manifest.js';
import {Arc} from './arc.js';
import {UnifiedStore} from './storageNG/unified-store.js';
import {RuntimeCacheService} from './runtime-cache.js';
import {IdGenerator, ArcId} from './id.js';
import {PecFactory} from './particle-execution-context.js';
import {SlotComposer} from './slot-composer.js';
import {Loader} from './loader.js';
import {StorageProviderFactory} from './storage/storage-provider-factory.js';
import {ArcInspectorFactory} from './arc-inspector.js';
import {FakeSlotComposer} from './testing/fake-slot-composer.js';
import {VolatileMemory} from './storageNG/drivers/volatile.js';
import {StorageKey} from './storageNG/storage-key.js';

export type RuntimeArcOptions = Readonly<{
  pecFactories?: PecFactory[];
  storageProviderFactory?: StorageProviderFactory;
  speculative?: boolean;
  innerArc?: boolean;
  stub?: boolean;
  listenerClasses?: ArcInspectorFactory[];
  inspectorFactory?: ArcInspectorFactory;
}>;

// To start with, this class will simply hide the runtime classes that are
// currently imported by ArcsLib.js. Once that refactoring is done, we can
// think about what the api should actually look like.
export class Runtime {
  private cacheService: RuntimeCacheService;
  private loader: Loader | null;
  private composerClass: new () => SlotComposer | null;
  public readonly context: Manifest;
  private readonly ramDiskMemory: VolatileMemory;
  readonly arcById = new Map<string, Arc>();

  static getRuntime() {
    if (runtime == null) {
      runtime = new Runtime();
    }
    return runtime;
  }

  static clearRuntimeForTesting() {
    if (runtime !== null) {
      runtime.destroy();
      runtime = null;
    }
  }

  static newForNodeTesting(context?: Manifest) {
    return new Runtime(new Loader(), FakeSlotComposer, context);
  }

  constructor(loader?: Loader, composerClass?: new () => SlotComposer, context?: Manifest) {
    this.cacheService = new RuntimeCacheService();
    this.loader = loader;
    this.composerClass = composerClass;
    this.context = context || new Manifest({id: 'manifest:default'});
    this.ramDiskMemory = new VolatileMemory();
    runtime = this;
    // user information. One persona per runtime for now.
  }

  getCacheService() {
    return this.cacheService;
  }

  getRamDiskMemory(): VolatileMemory {
    return this.ramDiskMemory;
  }

  destroy() {

  }

  // TODO(shans): Clean up once old storage is removed.
  // Note that this incorrectly assumes every storage key can be of the form `prefix` + `arcId`.
  // Should ids be provided to the Arc constructor, or should they be constructed by the Arc?
  // How best to provide default storage to an arc given whatever we decide?
  newArc(name: string, storageKeyPrefix: string | ((arcId: ArcId) => StorageKey), options?: RuntimeArcOptions): Arc {
    const id = IdGenerator.newSession().newArcId(name);
    const slotComposer = this.composerClass ? new this.composerClass() : null;
    if (typeof storageKeyPrefix === 'string') {
      const storageKey = storageKeyPrefix + id.toString();
      return new Arc({id, storageKey, loader: this.loader, slotComposer, context: this.context, ...options});
    } else {
      const storageKey = storageKeyPrefix(id);
      return new Arc({id, storageKey, loader: this.loader, slotComposer, context: this.context, ...options});
    }
  }

  // Stuff the shell needs

  /**
   * Given an arc name, return either:
   * (1) the already running arc
   * (2) a deserialized arc (TODO: needs implementation)
   * (3) a newly created arc
   */
  runArc(name: string, storageKeyPrefix: string, options?: RuntimeArcOptions): Arc {
    if (!this.arcById.has(name)) {
      // TODO: Support deserializing serialized arcs.
      this.arcById.set(name, this.newArc(name, storageKeyPrefix, options));
    }
    return this.arcById.get(name);
  }

  stop(name: string) {
    assert(this.arcById.has(name), `Cannot stop nonexistent arc ${name}`);
    this.arcById.get(name).dispose();
    this.arcById.delete(name);
  }

  findArcByParticleId(particleId: string): Arc {
    return [...this.arcById.values()].find(arc => !!arc.activeRecipe.findParticle(particleId));
  }

  // TODO: This is a temporary method to allow sharing stores with other Arcs.
  registerStore(store: UnifiedStore, tags: string[]): void {
    if (!this.context.findStoreById(store.id) && tags.includes('shared')) {
      this.context['_addStore'](store, tags);
    }
  }

  // Temporary method to allow sharing stores with other Arcs.
  unregisterStore(storeId: string, tags: string[]) {
    // #shared tag indicates that a store was made available to all arcs.
    if (!tags.includes('shared')) {
      return;
    }
    const index = this.context.stores.findIndex(store => store.id === storeId);
    if (index >= 0) {
      const store = this.context.stores[index];
      this.context.storeTags.delete(store);
      this.context.stores.splice(index, 1);
    }
  }

  /**
   * Given an arc, returns it's description as a string.
   */
  static async getArcDescription(arc: Arc) : Promise<string> {
    // Verify that it's one of my arcs, and make this non-static, once I have
    // Runtime objects in the calling code.
    return (await Description.create(arc)).getArcDescription();
  }

  /**
   * Parse a textual manifest and return a Manifest object. See the Manifest
   * class for the options accepted.
   */
  static async parseManifest(content: string, options?): Promise<Manifest> {
    return Manifest.parse(content, options);
  }

  /**
   * Load and parse a manifest from a resource (not striclty a file) and return
   * a Manifest object. The loader determines the semantics of the fileName. See
   * the Manifest class for details.
   */
  static async loadManifest(fileName, loader, options) : Promise<Manifest> {
    return Manifest.load(fileName, loader, options);
  }

  // stuff the strategizer needs

}

let runtime: Runtime = null;


