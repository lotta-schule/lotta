import * as React from 'react';
import { BrowserNode, BrowserPath } from '../BrowserStateContext';
import { Item, Menu } from '../../menu';
import { Toolbar } from '../../layout/Toolbar';
import { KeyboardArrowLeft } from '../../icon';
import { isDirectoryNode } from '../utils';

export interface DirectorySelector {
  getNodesForParent(parent: BrowserNode | null): Promise<BrowserNode[]>;
  value: BrowserPath;
  onChange: (value: BrowserPath) => void;
  filter?: (node: BrowserNode) => boolean;
}

export const DirectorySelector = React.memo(
  ({
    getNodesForParent,
    value,
    onChange,
    filter = () => true,
  }: DirectorySelector) => {
    const parentNode = value?.at(-2) ?? null;
    const potentialNode = value.at(-1);
    const currentNode = (
      potentialNode &&
      isDirectoryNode(potentialNode) &&
      potentialNode.parent === (parentNode?.id ?? null)
        ? potentialNode
        : null
    ) as BrowserNode<'directory'> | null;

    const [childNodes, setChildNodes] = React.useState<BrowserNode[]>([]);

    React.useEffect(() => {
      getNodesForParent(currentNode).then((newNodes) => {
        setChildNodes(newNodes.filter((n) => isDirectoryNode(n) && filter(n)));
      });
    }, [currentNode, getNodesForParent, filter]);

    return (
      <div>
        <Toolbar>{value.map((c) => c.name).join('/') || '/'}</Toolbar>
        <Menu
          style={{ width: '100%' }}
          title={currentNode?.name ?? 'Wurzelverzeichnis'}
          onAction={(k) => {
            if (k === 'parent') {
              onChange(value?.slice(0, value.length - 1) ?? []);
            } else {
              const childNode = childNodes.find((d) => d.id === k);
              if (childNode) {
                onChange([...value, childNode]);
              }
            }
          }}
        >
          {value.length > 0 &&
            ((
              <Item key={'parent'} textValue={'..'}>
                <KeyboardArrowLeft />
                <span>
                  ../
                  {parentNode?.name ?? 'Wurzelverzeichnis'}
                </span>
              </Item>
            ) as any)}
          {childNodes.map((directory) => (
            <Item key={directory.id} textValue={directory.id}>
              {directory.name}
            </Item>
          ))}
        </Menu>
      </div>
    );
  }
);
DirectorySelector.displayName = 'DirectorySelector';
