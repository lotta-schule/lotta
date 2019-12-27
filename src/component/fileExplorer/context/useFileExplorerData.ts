import { useContext } from 'react';
import fileExplorerContext from './FileExplorerContext';

export const useFileExplorerData = () => {
    return useContext(fileExplorerContext);
};