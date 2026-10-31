import * as migration_20261031_221848_init from './20261031_221848_init';

export const migrations = [
  {
    up: migration_20261031_221848_init.up,
    down: migration_20261031_221848_init.down,
    name: '20261031_221848_init',
  },
];
