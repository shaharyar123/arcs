/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import devtoolsChannelProvider from './devtools-channel-provider.js';
import {enableTracingAdapter} from './tracing-adapter.js';
import {ArcPlannerInvoker} from './arc-planner-invoker.js';

export class ArcDebugHandler {
  constructor(arc) {
    enableTracingAdapter();

    // Message handles go here.
    new ArcPlannerInvoker(arc);

    devtoolsChannelProvider.get().send({
      messageType: 'arc-available',
      messageBody: {
        id: arc.id.toString(),
        isSpeculative: arc.isSpeculative
      }
    });
  }
}