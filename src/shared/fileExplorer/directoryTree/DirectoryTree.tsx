import * as React from 'react';
import { TreeView } from '@material-ui/lab';
import { ArrowRight, ArrowDropDown } from '@material-ui/icons';
import { DirectoryTreeItem } from './DirectoryTreeItem';
import { DirectoryModel } from 'model';
import { SelectedDirectoryContext } from './SelectedDirectoryContext';

export interface DirectoryTreeProps {
    defaultExpandedDirectoryIds: string[];
    selectedDirectory: DirectoryModel | null;
    showOnlyReadOnlyDirectories?: boolean;
    onSelectDirectory(directory: DirectoryModel | null): void;
}

export const DirectoryTree = React.memo<DirectoryTreeProps>(
    ({ defaultExpandedDirectoryIds, selectedDirectory, onSelectDirectory }) => {
        const [expandedDirectoryIds, setExpandedDirectoryIds] = React.useState(
            defaultExpandedDirectoryIds
        );
        React.useEffect(() => {
            setExpandedDirectoryIds(defaultExpandedDirectoryIds);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [[...defaultExpandedDirectoryIds].sort().join('')]);
        return (
            <SelectedDirectoryContext.Provider
                value={[selectedDirectory, onSelectDirectory]}
            >
                <TreeView
                    expanded={expandedDirectoryIds}
                    selected={String(selectedDirectory?.id ?? 'null')}
                    defaultCollapseIcon={<ArrowDropDown />}
                    defaultExpandIcon={<ArrowRight />}
                    defaultEndIcon={<span style={{ width: 24 }} />}
                    onNodeToggle={(e, nodeIds) => {
                        setExpandedDirectoryIds(
                            // ensure 'null' is always expanded
                            nodeIds.indexOf('null') > -1
                                ? nodeIds
                                : ['null', ...nodeIds]
                        );
                    }}
                >
                    <DirectoryTreeItem
                        directory={null}
                        showOnlyReadOnlyDirectories
                    />
                </TreeView>
            </SelectedDirectoryContext.Provider>
        );
    }
);
DirectoryTree.displayName = 'DirectoryTree';
