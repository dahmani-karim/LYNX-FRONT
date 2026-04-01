import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SVG_PATH = resolve(__dirname, 'public/favicon.svg');
const OUTPUT_DIR = resolve(__dirname, 'public/icons');

const SIZES = [72, 96, 120, 128, 144, 152, 180, 192, 384, 512];

async function generateIcons() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const svgBuffer = readFileSync(SVG_PATH);

  for (const size of SIZES) {
    const outputPath = resolve(OUTPUT_DIR, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ ${size}x${size}`);
  }

  // Apple touch icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(resolve(OUTPUT_DIR, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon');

  // Maskable icon (512 with padding)
  const maskableSize = 512;
  const padding = Math.round(maskableSize * 0.1);
  const innerSize = maskableSize - 2 * padding;
  const inner = await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: { r: 8, g: 12, b: 20, alpha: 1 },
    },
  })
    .composite([{ input: inner, left: padding, top: padding }])
    .png()
    .toFile(resolve(OUTPUT_DIR, 'maskable-icon-512x512.png'));
  console.log('✓ maskable-icon-512x512');

  console.log('\nAll icons generated in public/icons/');
}

generateIcons().catch(console.error);
