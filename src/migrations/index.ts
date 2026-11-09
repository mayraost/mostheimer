import * as migration_20261031_221848_init from './20261031_221848_init';
import * as migration_20261031_224616 from './20261031_224616';
import * as migration_20261031_233235_codify_common_menu from './20261031_233235_codify_common_menu';
import * as migration_20261101_103630_fix_site_settings_locales from './20261101_103630_fix_site_settings_locales';
import * as migration_20261101_194051_maintenance_mode from './20261101_194051_maintenance_mode';
import * as migration_20261101_212429_add_page_drafts from './20261101_212429_add_page_drafts';
import * as migration_20261102_001219_fix_pages_draft_status_published from './20261102_001219_fix_pages_draft_status_published';
import * as migration_20261104_165006_add_skillset_blocks from './20261104_165006_add_skillset_blocks';
import * as migration_20261104_165445_add_mcp_api_keys from './20261104_165445_add_mcp_api_keys';
import * as migration_20261104_192059_add_spec_blocks from './20261104_192059_add_spec_blocks';
import * as migration_20261104_211055_add_architecture_diagram from './20261104_211055_add_architecture_diagram';
import * as migration_20261104_232628_add_command_palette_translations from './20261104_232628_add_command_palette_translations';
import * as migration_20261104_233319_add_cookie_consent_translations from './20261104_233319_add_cookie_consent_translations';
import * as migration_20261105_140354_remove_maintenance_mode from './20261105_140354_remove_maintenance_mode';
import * as migration_20261105_210002_add_clipboard_translations from './20261105_210002_add_clipboard_translations';
import * as migration_20261105_214053_add_contact_action_translations from './20261105_214053_add_contact_action_translations';
import * as migration_20261106_095612_add_footer_translations from './20261106_095612_add_footer_translations';
import * as migration_20261107_112826_add_session_refresh_columns from './20261107_112826_add_session_refresh_columns';
import * as migration_20261107_221931_add_clipboard_copied_inline from './20261107_221931_add_clipboard_copied_inline';
import * as migration_20261108_144000_add_ui_copy_translations from './20261108_144000_add_ui_copy_translations';
import * as migration_20261108_150000_seed_ui_copy_translations from './20261108_150000_seed_ui_copy_translations';
import * as migration_20261108_151500_de_command_palette_copy from './20261108_151500_de_command_palette_copy';
import * as migration_20261108_164101_add_site_identity from './20261108_164101_add_site_identity';
import * as migration_20261108_170000_seed_seo_copy from './20261108_170000_seed_seo_copy';
import * as migration_20261109_171931_add_vibe_projects from './20261109_171931_add_vibe_projects';
import * as migration_20261109_175000_add_vibe_showcase_block from './20261109_175000_add_vibe_showcase_block';
import * as migration_20261109_180000_seed_vibe_showcase_copy from './20261109_180000_seed_vibe_showcase_copy';

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
  {
    up: migration_20261104_165006_add_skillset_blocks.up,
    down: migration_20261104_165006_add_skillset_blocks.down,
    name: '20261104_165006_add_skillset_blocks',
  },
  {
    up: migration_20261104_165445_add_mcp_api_keys.up,
    down: migration_20261104_165445_add_mcp_api_keys.down,
    name: '20261104_165445_add_mcp_api_keys',
  },
  {
    up: migration_20261104_192059_add_spec_blocks.up,
    down: migration_20261104_192059_add_spec_blocks.down,
    name: '20261104_192059_add_spec_blocks',
  },
  {
    up: migration_20261104_211055_add_architecture_diagram.up,
    down: migration_20261104_211055_add_architecture_diagram.down,
    name: '20261104_211055_add_architecture_diagram',
  },
  {
    up: migration_20261104_232628_add_command_palette_translations.up,
    down: migration_20261104_232628_add_command_palette_translations.down,
    name: '20261104_232628_add_command_palette_translations',
  },
  {
    up: migration_20261104_233319_add_cookie_consent_translations.up,
    down: migration_20261104_233319_add_cookie_consent_translations.down,
    name: '20261104_233319_add_cookie_consent_translations',
  },
  {
    up: migration_20261105_140354_remove_maintenance_mode.up,
    down: migration_20261105_140354_remove_maintenance_mode.down,
    name: '20261105_140354_remove_maintenance_mode',
  },
  {
    up: migration_20261105_210002_add_clipboard_translations.up,
    down: migration_20261105_210002_add_clipboard_translations.down,
    name: '20261105_210002_add_clipboard_translations',
  },
  {
    up: migration_20261105_214053_add_contact_action_translations.up,
    down: migration_20261105_214053_add_contact_action_translations.down,
    name: '20261105_214053_add_contact_action_translations',
  },
  {
    up: migration_20261106_095612_add_footer_translations.up,
    down: migration_20261106_095612_add_footer_translations.down,
    name: '20261106_095612_add_footer_translations',
  },
  {
    up: migration_20261107_112826_add_session_refresh_columns.up,
    down: migration_20261107_112826_add_session_refresh_columns.down,
    name: '20261107_112826_add_session_refresh_columns',
  },
  {
    up: migration_20261107_221931_add_clipboard_copied_inline.up,
    down: migration_20261107_221931_add_clipboard_copied_inline.down,
    name: '20261107_221931_add_clipboard_copied_inline',
  },
  {
    up: migration_20261108_144000_add_ui_copy_translations.up,
    down: migration_20261108_144000_add_ui_copy_translations.down,
    name: '20261108_144000_add_ui_copy_translations',
  },
  {
    up: migration_20261108_150000_seed_ui_copy_translations.up,
    down: migration_20261108_150000_seed_ui_copy_translations.down,
    name: '20261108_150000_seed_ui_copy_translations',
  },
  {
    up: migration_20261108_151500_de_command_palette_copy.up,
    down: migration_20261108_151500_de_command_palette_copy.down,
    name: '20261108_151500_de_command_palette_copy',
  },
  {
    up: migration_20261108_164101_add_site_identity.up,
    down: migration_20261108_164101_add_site_identity.down,
    name: '20261108_164101_add_site_identity',
  },
  {
    up: migration_20261108_170000_seed_seo_copy.up,
    down: migration_20261108_170000_seed_seo_copy.down,
    name: '20261108_170000_seed_seo_copy',
  },
  {
    up: migration_20261109_171931_add_vibe_projects.up,
    down: migration_20261109_171931_add_vibe_projects.down,
    name: '20261109_171931_add_vibe_projects',
  },
  {
    up: migration_20261109_175000_add_vibe_showcase_block.up,
    down: migration_20261109_175000_add_vibe_showcase_block.down,
    name: '20261109_175000_add_vibe_showcase_block',
  },
  {
    up: migration_20261109_180000_seed_vibe_showcase_copy.up,
    down: migration_20261109_180000_seed_vibe_showcase_copy.down,
    name: '20261109_180000_seed_vibe_showcase_copy',
  },
];
