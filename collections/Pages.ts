import type { CollectionConfig } from 'payload';
import { Hero } from '../blocks/Hero';
import { RichText } from '../blocks/RichText';
import { CallToAction } from '../blocks/CallToAction';
import { FeatureGrid } from '../blocks/FeatureGrid';
import { ImageText } from '../blocks/ImageText';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [Hero, RichText, CallToAction, FeatureGrid, ImageText],
      localized: true,
    },
  ],
};
