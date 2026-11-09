import type { CollectionConfig, FieldHook } from 'payload';

import { protectedAuthorshipFields } from '../security/authorship';
import { revalidateVibeTagsCache } from '../cache/frontend/frontendCache';
import { toUrlSlug } from '../slugField';
import { wordingBeforeValidate } from '../wording/beforeValidateWordingCheck';

/**
 * Filter tags for the vibe-coding showcase (`vibeProjects.tags`, design doc § 10).
 *
 * A small collection, not an enum: a tag needs a STABLE url slug (`?tag=<slug>`),
 * one place to rename the visible label per locale, and creation without a
 * migration + deploy. Renaming the label never changes a URL; renaming the slug
 * is the one breaking operation and is covered by the listing flush below.
 *
 * No drafts: a tag is public as soon as it exists (the chip row reads it).
 */
const slugFromLabel: FieldHook = ({ value, data }) => toUrlSlug(value ?? data?.label);

export const VibeTags: CollectionConfig = {
  slug: 'vibeTags',
  labels: { singular: 'Tag', plural: 'Tags' },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'slug', 'updatedAt'],
    group: 'Content',
  },
  // Public labels for the chips: only published projects expose the slug, and
  // the label is site copy.
  access: { read: () => true },
  hooks: {
    // Wording guardrail (same hook as pages/translations/site-settings).
    beforeValidate: [wordingBeforeValidate],
    // A rename or delete changes every `?tag=<slug>` variant and the chip row
    // itself, so the listing projection is flushed as well. The previous slug
    // is the one whose URLs exist on the edge after a rename.
    afterChange: [({ doc, previousDoc }) => revalidateVibeTagsCache(previousDoc?.slug ?? doc.slug)],
    afterDelete: [({ doc }) => revalidateVibeTagsCache(doc.slug)],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Sichtbarer Chip-Text (je Locale)' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: '?tag=<slug> — stabil halten, nicht übersetzen' },
      hooks: { beforeValidate: [slugFromLabel] },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: { description: 'Optional, nur Admin' },
    },
    // Authorship is admin-only metadata; public reads must not carry it.
    ...protectedAuthorshipFields(),
  ],
};
