import * as React from 'react';
import { DirectoryModel, ID } from 'model';
import { Path } from '../context/FileExplorerContext';

const directory: DirectoryModel | null = null;
const setDirectory = () => {};

export const SelectedDirectoryContext = React.createContext<
    [Path, (path: Path) => void]
>([directory, setDirectory] as any);

export const useSelectedDirectory = () =>
    React.useContext(SelectedDirectoryContext);

export const SelectedDirectoryContextProvider = React.memo(
    ({
        children,
        defaultPath,
        onSelectDirectoryId,
    }: {
        children: React.ReactNode;
        defaultPath: Path;
        onSelectDirectoryId: (id: ID | null) => void;
    }) => {
        const [path, setPath] = React.useState(defaultPath);

        React.useEffect(() => {
            onSelectDirectoryId(path.at(-1)?.id ?? null);
        }, [onSelectDirectoryId, path]);

        return (
            <SelectedDirectoryContext.Provider value={[path, setPath]}>
                {children}
            </SelectedDirectoryContext.Provider>
        );
    }
);
SelectedDirectoryContextProvider.displayName =
    'SelectedDirectoryContextProvider';
