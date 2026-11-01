import * as migration_20261031_221848_init from './20261031_221848_init';
import * as migration_20261031_224616 from './20261031_224616';
import * as migration_20261031_233235_codify_common_menu from './20261031_233235_codify_common_menu';
import * as migration_20261101_103630_fix_site_settings_locales from './20261101_103630_fix_site_settings_locales';
import * as migration_20261101_194051_maintenance_mode from './20261101_194051_maintenance_mode';
import * as migration_20261101_212429_add_page_drafts from './20261101_212429_add_page_drafts';
import * as migration_20261102_001219_fix_pages_draft_status_published from './20261102_001219_fix_pages_draft_status_published';

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
  {
    up: migration_20261101_212429_add_page_drafts.up,
    down: migration_20261101_212429_add_page_drafts.down,
    name: '20261101_212429_add_page_drafts',
  },
  {
    up: migration_20261102_001219_fix_pages_draft_status_published.up,
    down: migration_20261102_001219_fix_pages_draft_status_published.down,
    name: '20261102_001219_fix_pages_draft_status_published',
  },
];
