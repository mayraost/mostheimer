import * as migration_20261031_221848_init from './20261031_221848_init';
import * as migration_20261031_224616 from './20261031_224616';
import * as migration_20261031_233235_codify_common_menu from './20261031_233235_codify_common_menu';
import * as migration_20261101_103630_fix_site_settings_locales from './20261101_103630_fix_site_settings_locales';
import * as migration_20261101_194051_maintenance_mode from './20261101_194051_maintenance_mode';

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
  {
    up: migration_20261031_233235_codify_common_menu.up,
    down: migration_20261031_233235_codify_common_menu.down,
    name: '20261031_233235_codify_common_menu',
  },
  {
    up: migration_20261101_103630_fix_site_settings_locales.up,
    down: migration_20261101_103630_fix_site_settings_locales.down,
    name: '20261101_103630_fix_site_settings_locales',
  },
  {
    up: migration_20261101_194051_maintenance_mode.up,
    down: migration_20261101_194051_maintenance_mode.down,
    name: '20261101_194051_maintenance_mode',
  },
];
