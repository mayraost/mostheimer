/**
 * Brand icon generator — one source, every static brand asset.
 *
 * Every file below is derived from `src/components/brand/markGeometry.ts`, so
 * a change to the monogram propagates instead of drifting:
 *
 *   src/app/icon.svg            vector favicon (dark palette, transparent)
 *   src/app/favicon.ico         16/32/48 PNG-in-ICO (Vista+)
 *   src/app/apple-icon.png      180px, opaque plate (iOS ignores alpha)
 *   src/public/icon-192.png      PWA / manifest
 *   src/public/icon-512.png      PWA / manifest + maskable variant
 *
 * Static icons ALWAYS use `MARK_PALETTE_DARK`: a favicon has no notion of the
 * page's theme, and the brand is dark-first.
 *
 * Run: `npm run generate:icons`
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

import {
  LOCKUP,
  LOCKUP_BASELINE_1,
  LOCKUP_BASELINE_2,
  LOCKUP_BOX,
  LOCKUP_SUBLINE_Y,
  MARK,
  MARK_PALETTE_DARK,
  MARK_TOP_PAD,
  PATHS,
  RETICLE,
  SUBLINE_SIZE,
} from '../src/components/brand/markGeometry';

const P = MARK_PALETTE_DARK;
const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'src/app');
const PUBLIC_DIR = path.join(ROOT, 'src/public');

type TileOptions = {
  /** Canvas size in px. */
  size: number;
  /** Fraction of the canvas kept free on each side (maskable safe area). */
  pad: number;
  /** Draw the rounded plate + grid. Off = transparent emblem only. */
  plate: boolean;
  /** Corner radius of the plate, in px. */
  radius: number;
  /**
   * Draw the reticle frame and the `</>` accent.
   *
   * Favicons at 16–48 px cannot resolve them: a 2-unit stroke becomes 0.1 px
   * and the `</>` turns into coloured noise, so the mark reads as a green blob
   * (measured — see the 16 px study in the PR). Below 64 px the emblem is
   * therefore simplified to the M/O ribbons, which is the part that carries
   * recognition at that size.
   */
  detail?: boolean;
};

/**
 * Emblem + optional plate, as an SVG document.
 *
 * The monogram is centred by the pad fraction, so `pad: 0.2` (Android's
 * maskable crop) shrinks the emblem instead of clipping it.
 */
function iconSvg({ size, pad, plate, radius, detail = true }: TileOptions): string {
  const inset = size * pad;
  const inner = size - inset * 2;
  // Fit the 440 x 300 mark into the inner square without distortion.
  const scale = inner / MARK.width;
  const drawHeight = MARK.height * scale;
  const offsetY = inset + (inner - drawHeight) / 2;
  // A negative pad draws outside the canvas; widen the viewBox instead of
  // letting the renderer silently crop the emblem.
  const bleed = Math.max(0, -inset);
  const box = size + bleed * 2;

  const grid = plate
    ? `<g stroke="${P.tileStroke}" stroke-width="${Math.max(1, size / 256)}" opacity="0.6">
        ${[0.25, 0.5, 0.75]
          .map(
            (t) =>
              `<line x1="${size * t}" y1="0" x2="${size * t}" y2="${size}"/>` +
              `<line x1="0" y1="${size * t}" x2="${size}" y2="${size * t}"/>`,
          )
          .join('')}
      </g>`
    : '';

  const plateSvg = plate
    ? `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="${P.tileFill}"/>
       ${grid}`
    : '';

  const mark = markMarkup(detail).replace(
    `<polygon points="${PATHS.bridgeGap}" fill="#00000000"/>`,
    `<polygon points="${PATHS.bridgeGap}" fill="${plate ? P.tileFill : '#00000000'}"/>`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-bleed} ${-bleed} ${box} ${box}" preserveAspectRatio="xMidYMid meet">
    ${plateSvg}
    <g transform="translate(${inset}, ${offsetY}) scale(${scale})">${mark}</g>
  </svg>`;
}

/** Monogram markup in the 440 x 300 artwork box, with or without fine detail. */
function markMarkup(detail = true): string {
  const reticle = `<g fill="none" stroke-width="2">
      ${RETICLE.strokes
        .map(
          (points, i) =>
            `<polyline points="${points}" stroke="${i < 2 ? P.reticleA : P.reticleB}" stroke-opacity="0.55"/>`,
        )
        .join('')}
    </g>
    ${RETICLE.squares
      .map(
        (s, i) =>
          `<rect x="${s.x}" y="${s.y}" width="6" height="6" fill="${i < 2 ? P.reticleA : P.reticleB}"/>`,
      )
      .join('')}`;

  return `
    ${detail ? reticle : ''}
    <path d="${PATHS.mLeft}" fill="${P.mLeft[1]}"/>
    <path d="${PATHS.mRight}" fill="${P.mRight[0]}"/>
    <polygon points="${PATHS.mFold}" fill="${P.fold}" fill-opacity="0.45"/>
    ${
      detail
        ? `<g fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="${PATHS.codeLeft}" stroke="${P.codeLeft}"/>
      <line x1="${PATHS.codeSlash.x1}" y1="${PATHS.codeSlash.y1}" x2="${PATHS.codeSlash.x2}" y2="${PATHS.codeSlash.y2}" stroke="${P.codeSlash}"/>
      <polyline points="${PATHS.codeRight}" stroke="${P.codeRight}"/>
    </g>`
        : ''
    }
    <path d="${PATHS.oTop}" fill="${P.oTop[0]}"/>
    <path d="${PATHS.oBottom}" fill="${P.oBottom[1]}"/>
    <polygon points="${PATHS.bridgeGap}" fill="#00000000"/>
    <polygon points="${PATHS.bridgeLink}" fill="${P.oTop[0]}"/>`;
}

/**
 * Standalone full lockup, for design handoff / press / external use.
 *
 * Opened outside the app, so it has no `next/font` and no CSS custom
 * properties: the dark palette is written literally and the type asks for
 * Space Grotesk with a fallback chain. Every measurement is imported from
 * `markGeometry.ts`, so the file cannot drift from the in-app lockup.
 */
function buildStandaloneLockup(): string {
  const { wordSize, gap, divider, tracking, subTracking } = LOCKUP;
  const subSize = SUBLINE_SIZE.header;
  const textX = MARK.width + gap;
  const dividerX = MARK.width + divider.gap;
  const { width, height } = LOCKUP_BOX.full;

  const fonts = `'Space Grotesk','Helvetica Neue',Arial,sans-serif`;
  const mono = `'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace`;
  const midY = MARK_TOP_PAD + MARK.height / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Mayra Ostheimer — Web &amp; Application Architect">
  <title>Mayra Ostheimer — Web &amp; Application Architect</title>
  <g transform="translate(0, ${MARK_TOP_PAD})">${markMarkup()}
  </g>
  <line x1="${dividerX}" y1="${midY - 96}" x2="${dividerX}" y2="${midY + 96}" stroke="${P.tileStroke}" stroke-width="${divider.width}"/>
  <rect x="${dividerX - divider.width + 1}" y="${midY - 23}" width="${divider.width + 2}" height="46" fill="${P.mRight[0]}"/>
  <text x="${textX}" y="${LOCKUP_BASELINE_1}" font-family="${fonts}" font-weight="700" font-size="${wordSize}" letter-spacing="${tracking}" fill="#F8FAFC">MAYRA</text>
  <text x="${textX}" y="${LOCKUP_BASELINE_2}" font-family="${fonts}" font-weight="700" font-size="${wordSize}" letter-spacing="${tracking}" fill="#F8FAFC">OSTHEIMER</text>
  <text x="${textX + 2}" y="${LOCKUP_SUBLINE_Y}" font-family="${mono}" font-weight="700" font-size="${subSize}" letter-spacing="${subTracking}"><tspan fill="${P.reticleA}">// </tspan><tspan fill="${P.reticleB}">WEB &amp; APPLICATION ARCHITECT</tspan></text>
</svg>
`;
}

/** ICO container: 6-byte header, 16-byte directory entry per image, PNG payloads. */
function buildIco(images: { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(images.length, 4);

  const dir = Buffer.alloc(16 * images.length);
  let offset = header.length + dir.length;

  images.forEach((image, index) => {
    const at = index * 16;
    // 256 is encoded as 0 in this field.
    dir.writeUInt8(image.size >= 256 ? 0 : image.size, at + 0);
    dir.writeUInt8(image.size >= 256 ? 0 : image.size, at + 1);
    dir.writeUInt8(0, at + 2); // palette colours
    dir.writeUInt8(0, at + 3); // reserved
    dir.writeUInt16LE(1, at + 4); // colour planes
    dir.writeUInt16LE(32, at + 6); // bits per pixel
    dir.writeUInt32LE(image.png.length, at + 8);
    dir.writeUInt32LE(offset, at + 12);
    offset += image.png.length;
  });

  return Buffer.concat([header, dir, ...images.map((image) => image.png)]);
}

async function main() {
  await mkdir(APP_DIR, { recursive: true });
  await mkdir(PUBLIC_DIR, { recursive: true });

  // ── icon.svg: transparent vector emblem, dark palette ───────────────────
  const svgDoc = iconSvg({ size: 512, pad: 0.06, plate: false, radius: 0 });
  await writeFile(path.join(APP_DIR, 'icon.svg'), `${svgDoc}\n`, 'utf8');
  console.log('written src/app/icon.svg');

  // ── favicon.ico: 16/32/48, transparent, simplified emblem ───────────────
  // The reticle and `</>` are dropped at these sizes (see `detail`); the crop
  // is tighter because the ribbons must fill the tile to stay legible.
  const icoSizes = [16, 32, 48];
  const icoImages = await Promise.all(
    icoSizes.map(async (size) => ({
      size,
      png: await sharp(
        Buffer.from(
          iconSvg({ size: size * 8, pad: 0.015, plate: false, radius: 0, detail: false }),
        ),
      )
        .resize(size, size, { fit: 'contain' })
        .png()
        .toBuffer(),
    })),
  );
  await writeFile(path.join(APP_DIR, 'favicon.ico'), buildIco(icoImages));
  console.log('written src/app/favicon.ico (16/32/48, simplified)');

  // ── apple-icon.png: 180px, OPAQUE plate (iOS ignores alpha) ─────────────
  const apple = await sharp(
    Buffer.from(iconSvg({ size: 180 * 8, pad: 0.12, plate: true, radius: 8 * 18 })),
  )
    .resize(180, 180)
    .flatten({ background: P.tileFill })
    .png()
    .toBuffer();
  await writeFile(path.join(APP_DIR, 'apple-icon.png'), apple);
  console.log('written src/app/apple-icon.png (180, opaque)');

  // ── PWA icons: 'any' keeps a tighter crop, 'maskable' pads 20% ───────────
  for (const [size, file] of [
    [192, 'icon-192.png'],
    [512, 'icon-512.png'],
  ] as const) {
    const png = await sharp(
      Buffer.from(iconSvg({ size: size * 4, pad: 0.08, plate: true, radius: size * 0.14 })),
    )
      .resize(size, size)
      .png()
      .toBuffer();
    await writeFile(path.join(PUBLIC_DIR, file), png);
    console.log(`written src/public/${file}`);
  }

  // Maskable variant: Android crops up to 20% per side, so the emblem has to
  // live inside the safe circle. Separate file — sharing one would look too
  // small when used unmasked.
  const maskable = await sharp(
    Buffer.from(iconSvg({ size: 512 * 4, pad: 0.2, plate: true, radius: 0 })),
  )
    .resize(512, 512)
    .png()
    .toBuffer();
  await writeFile(path.join(PUBLIC_DIR, 'icon-512-maskable.png'), maskable);
  console.log('written src/public/icon-512-maskable.png');

  await writeFile(path.join(PUBLIC_DIR, 'logo-lockup.svg'), buildStandaloneLockup(), 'utf8');
  console.log('written src/public/logo-lockup.svg');

  // Preview sheet for eyeballing the result.
  const previewDir = '/tmp/opencode/logo-new';
  await mkdir(previewDir, { recursive: true });
  await sharp(
    Buffer.from(iconSvg({ size: 512 * 3, pad: 0.08, plate: true, radius: 512 * 3 * 0.14 })),
  )
    .resize(512, 512)
    .toFile(path.join(previewDir, 'icon-512-preview.png'));
  await sharp(Buffer.from(svgDoc))
    .resize(256, 256)
    .flatten({ background: '#090a0d' })
    .toFile(path.join(previewDir, 'icon-svg-on-dark.png'));
  await sharp(Buffer.from(svgDoc))
    .resize(256, 256)
    .flatten({ background: '#f8fafc' })
    .toFile(path.join(previewDir, 'icon-svg-on-light.png'));
  console.log('previews in /tmp/opencode/logo-new');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
