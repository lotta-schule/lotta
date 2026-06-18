import type { Locator, Page, BrowserContext } from 'playwright';
import type { Plugin } from 'vitest/config';
import type { BrowserCommand, BrowserCommandContext } from 'vitest/node';

type PlaywrightContext = BrowserCommandContext & {
  iframe: Page;
  context: BrowserContext;
};

export type FileDescriptor = {
  name: string;
  type: string;
  content: string;
};

export type DataTransferDescriptor = Record<string, string>;

export const setFiles: BrowserCommand<
  [locator: Locator | string, files: FileDescriptor[]]
> = async (rawCtx, locator, fileDescriptors) => {
  const { iframe, provider } = rawCtx as PlaywrightContext;
  if (provider.name === 'playwright') {
    const pageLocator =
      typeof locator === 'string' ? iframe.locator(locator) : locator;
    await pageLocator.setInputFiles(
      fileDescriptors.map((file) => ({
        name: file.name,
        mimeType: file.type,
        buffer: Buffer.from(file.content),
      }))
    );
    return;
  }

  throw new Error(`provider ${provider.name} is not supported`);
};

export const setFile: BrowserCommand<
  [locator: Locator | string, file: FileDescriptor]
> = (ctx, locator, fileDescriptor) => setFiles(ctx, locator, [fileDescriptor]);

export const paste: BrowserCommand<[transfer: DataTransferDescriptor]> = async (
  rawCtx,
  transfer
) => {
  const { context, iframe, provider } = rawCtx as PlaywrightContext;
  if (provider.name === 'playwright') {
    await context.grantPermissions(['clipboard-read']);

    await iframe.locator('body').evaluate(
      (
        body: HTMLBodyElement,
        { transfer }: { transfer: DataTransferDescriptor }
      ) => {
        const element = body.ownerDocument.activeElement || body;
        const clipboardData = {
          _data: transfer,
          get types() {
            return Object.keys(this._data);
          },
          getData(type: string) {
            return this._data[type];
          },
        };

        const pasteEvent = Object.assign(
          new Event('paste', { bubbles: true, cancelable: true }),
          {
            clipboardData,
          }
        );

        element.dispatchEvent(pasteEvent);
      },
      { transfer }
    );
    return;
  }

  throw new Error(`provider ${provider.name} is not supported`);
};

export function browserCommands(): Plugin {
  return {
    name: 'vitest:lotta-test-browser-commands',
    config() {
      return {
        test: {
          browser: {
            commands: {
              setFile,
              setFiles,
              paste,
            },
          },
        },
      };
    },
  };
}

export default browserCommands;
