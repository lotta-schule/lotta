import { writeFile, mkdir } from 'fs/promises';
import { test } from '@playwright/test';

let screenshotCounter = 0;
export const screenSave = async (
  bufferOrBufferPromise: Promise<Buffer> | Buffer,
  name: string | undefined = undefined
) => {
  const browser = (test as any).browser;
  const buffer = await bufferOrBufferPromise;
  await mkdir(`./screenshot/${browser?.browserType}`, { recursive: true });
  await writeFile(
    `./screenshot/${browser?.browserType}/${name || screenshotCounter++}.png`,
    buffer
  );
};
