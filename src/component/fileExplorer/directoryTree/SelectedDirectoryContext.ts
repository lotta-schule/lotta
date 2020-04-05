import { createContext } from 'react';
import { DirectoryModel } from 'model';

const directory: DirectoryModel | null = null;
const setDirectory = (directory: DirectoryModel) => { };

export const SelectedDirectoryContext = createContext<[DirectoryModel | null, (d: DirectoryModel) => void]>([directory, setDirectory] as any);