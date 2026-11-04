import type { Block } from 'payload';

export const CaseStudy: Block = {
  slug: 'caseStudy',
  labels: {
    singular: 'Case Study',
    plural: 'Case Studies',
  },
  fields: [
    {
      name: 'client',
      type: 'text',
      required: true,
      admin: {
        description: 'Client / project name',
      },
    },
    {
      name: 'period',
      type: 'text',
      admin: {
        description: 'e.g. "2024 – Heute"',
      },
    },
    {
      name: 'context',
      type: 'textarea',
      admin: {
        description: 'Kontext & Herausforderung',
      },
    },
    {
      name: 'solution',
      type: 'textarea',
      admin: {
        description: 'Technische Architektur & Lösung',
      },
    },
    {
      name: 'contribution',
      type: 'textarea',
      admin: {
        description: 'Mein Beitrag & Impact',
      },
    },
    {
      name: 'role',
      type: 'text',
      admin: {
        description: 'Role title',
      },
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        description: 'External link (e.g. aduardo.com)',
      },
    },
    {
      name: 'linkLabel',
      type: 'text',
      admin: {
        description: 'Link label (only rendered if link is set)',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'e.g. client names',
      },
    },
  ],
};
