import { writeFile } from 'fs/promises';

let screenshotCounter = 0;
export const screenSave = async (
  bufferOrBufferPromise: Promise<Buffer> | Buffer,
  name: string | undefined = undefined
) => {
  const buffer = await bufferOrBufferPromise;
  await writeFile(name ?? `./screenshot/${screenshotCounter++}.png`, buffer);
};
