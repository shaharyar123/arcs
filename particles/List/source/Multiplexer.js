/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
'use strict';

/* global defineParticle */

defineParticle(({Particle, UiMultiplexerParticle}) => {

  const composeRecipeManifest = (hostedParticle, itemHandle, slot, other) => Particle.buildManifest`

${hostedParticle}
recipe
  use '${itemHandle._id}' as handle1
  ${other.handles.join('\n')}
  slot '${slot.id}' as slot1
  ${hostedParticle.name}
    ${hostedParticle.handleConnections[0].name} <- handle1
    ${other.connections.join('\n')}
    consume ${slot.name} as slot1
`;

  return class Multiplexer extends UiMultiplexerParticle {
    constructInnerRecipe(hostedParticle, item, itemHandle, slot, other) {
      return composeRecipeManifest(hostedParticle, itemHandle, slot, other);
    }
  };
});
