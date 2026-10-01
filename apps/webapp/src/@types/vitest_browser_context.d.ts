import type { FileDescriptor, DataTransferDescriptor } from '../test/commands';
export * from 'vitest/browser/context';

declare module 'vitest/browser/context' {
  export interface BrowserCommands {
    setFile: (locator: Locator, file: FileDescriptor) => Promise<void>;
    setFiles: (locator: Locator, files: FileDescriptor[]) => Promise<void>;
    paste: (transfer: DataTransferDescriptor) => Promise<void>;
  }
}
