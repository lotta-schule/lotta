'use client';

import * as React from 'react';
import {
  Button,
  Input,
  Label,
  Option,
  Select,
  Toolbar,
} from '@lotta-schule/hubert';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CreateUserGroupDialog } from './CreateUserGroupDialog';

import styles from './GroupListToolbar.module.scss';

type Sorting = 'custom' | 'name';

export const GroupListToolbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] =
    React.useState(false);

  const [searchText, setSearchText] = React.useState(
    (searchParams?.get('s') as string) ?? ''
  );
  const [sorting, setSorting] = React.useState<Sorting>(
    (searchParams?.get('sort') as Sorting) || 'custom'
  );

  React.useEffect(() => {
    if (searchText !== ((searchParams?.get('s') ?? '') as string)) {
      const updatedSearchParams = new URLSearchParams(
        Array.from(searchParams?.entries() ?? ([] as string[][]))
      );
      updatedSearchParams.set('s', searchText);
      const newRoute = `${pathname}?${updatedSearchParams.toString()}`;
      router.replace(newRoute);
    }
  }, [searchText, searchParams, pathname, router]);

  React.useEffect(() => {
    if (sorting !== (searchParams?.get('sort') ?? ('custom' as Sorting))) {
      const updatedSearchParams = new URLSearchParams(
        Array.from(searchParams?.entries() ?? ([] as string[][]))
      );
      updatedSearchParams.set('sort', sorting);
      const newRoute = `${pathname}?${updatedSearchParams.toString()}`;
      router.replace(newRoute);
    }
  }, [sorting, searchParams, pathname, router]);

  return (
    <Toolbar
      hasScrollableParent
      stackOnMobile
      withPadding
      className={styles.root}
    >
      <Button
        className={styles.createGroupButton}
        onClick={() => setIsCreateGroupDialogOpen(true)}
      >
        Gruppe erstellen
      </Button>
      <Label label={'Suche'} className={styles.groupSearch}>
        <Input
          placeholder={'Gruppenname'}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.currentTarget.value);
          }}
        />
      </Label>
      <Select
        className={styles.sorting}
        title={'Sortierung'}
        value={sorting}
        onChange={(v) => {
          setSorting(v as Sorting);
        }}
      >
        <Option value={'custom'}>Eigene</Option>
        <Option value={'name'}>Name</Option>
      </Select>
      <CreateUserGroupDialog
        isOpen={isCreateGroupDialogOpen}
        onConfirm={(group) => {
          setIsCreateGroupDialogOpen(false);
          router.push(`/admin/users/groups/${group.id}`);
        }}
        onAbort={() => setIsCreateGroupDialogOpen(false)}
      />
    </Toolbar>
  );
};
