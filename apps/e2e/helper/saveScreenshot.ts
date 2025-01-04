import { writeFile, mkdir } from 'fs/promises';

export const saveScreenshot = async (
  buffer: Buffer,
  name: string,
  browserName: string
) => {
  const basePath = `./screenshot/${browserName}`;
  await mkdir(basePath, { recursive: true });
  await writeFile(`${basePath}/${name}.png`, buffer);
};
