/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Icon } from './Icon';

export function FeatureGridBlock({ block }: { block: any }) {
  return (
    <section className="w-full py-16 my-10">
      <h2 className="text-3xl lg:text-5xl font-averia font-bold text-center mb-12">
        {block.heading}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {block.features?.map((feature: any, i: number) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-header border border-border text-center flex flex-col items-center hover:-translate-y-1 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
              <Icon name={feature.iconName} className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-averia mb-2">{feature.title}</h3>
            <p className="opacity-80 font-geist-mono">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
