'use client';

import { use, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Brücke für ASYNC Server Components (`Footer`, `BlockRenderer` …) in Stories.
 *
 * Im Browser gibt es keine Server-Renderer-Phase: eine `async function
 * Component()` liefert schlicht ein Promise. Statt die Komponente umzubauen
 * (verboten — Storybook darf das Produkt nicht verändern) rufen wir sie auf
 * und lösen das Promise mit `use()` auf.
 *
 * `use(promise)` verlangt eine STABILE Promise-Identität über Re-Renders.
 * Deshalb erzeugt {@link AsyncComponent} sie in einem Lazy-`useState`
 * (genau einmal pro Mount) und wird von den Stories über `key` remountet,
 * wenn sich die Args ändern. Ein direkt im `render` erzeugtes Promise würde
 * bei jedem Re-Render neu suspendieren.
 *
 * `Suspense` muss der Aufrufer stellen — ohne Boundary rendert React den
 * ganzen Story-Baum leer, bis das Promise aufgelöst ist.
 */
export function AsyncNode({ node }: { node: Promise<ReactNode> }) {
  return <>{use(node)}</>;
}

/** Wie {@link AsyncNode}, erzeugt das Promise aber selbst (einmal pro Mount). */
export function AsyncComponent({ create }: { create: () => Promise<ReactNode> }) {
  const [node] = useState(create);
  return <AsyncNode node={node} />;
}
