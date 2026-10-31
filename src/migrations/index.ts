import * as migration_20261031_221848_init from './20261031_221848_init';
import * as migration_20261031_224616 from './20261031_224616';

export const migrations = [
  {
    up: migration_20261031_221848_init.up,
    down: migration_20261031_221848_init.down,
    name: '20261031_221848_init',
  },
  {
    up: migration_20261031_224616.up,
    down: migration_20261031_224616.down,
    name: '20261031_224616',
  },
];
