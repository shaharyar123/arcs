/**
 * @license
 * Copyright (c) 2019 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
import minimist from 'minimist';
import {Schema2Cpp} from './schema2cpp.js';
import {Schema2Kotlin} from './schema2kotlin.js';

// TODO: schemas with multiple names and schemas with parents
// TODO: schemas with no fields
// TODO: schemas with no names?  i.e. inline '* {Text s}'

const opts = minimist(process.argv.slice(2), {
  string: ['outdir', 'outfile'],
  boolean: ['cpp', 'kotlin', 'update', 'help'],
  alias: {c: 'cpp', k: 'kotlin', d: 'outdir', f: 'outfile', u: 'update'},
  default: {outdir: '.'}
});

if (opts.help || opts._.length === 0) {
  console.log(`
Usage
  $ tools/sigh schema2pkg [options] [file ...]

Description
  Generates entity class code from schemas for use in wasm particles.

Options
  --cpp, -c      generate C++ code
  --kotlin, -k   generate Kotlin code
  --outdir, -d   output directory; defaults to '.'
  --outfile, -f  output filename; if omitted, generated from the manifest name
  --update, -u   only generate if the source file is newer than the destination
  --help         usage info
`);
  process.exit(0);
}
if (!opts.cpp && !opts.kotlin) {
  console.error('No target language specified (--cpp and/or --kotlin)');
  process.exit(1);
}
if (opts.outdir === '') {
  console.error('Output dir cannot be empty');
  process.exit(1);
}

async function go() {
  try {
    if (opts.cpp) {
      await new Schema2Cpp(opts).call();
    }
    if (opts.kotlin) {
      await new Schema2Kotlin(opts).call();
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

void go();
