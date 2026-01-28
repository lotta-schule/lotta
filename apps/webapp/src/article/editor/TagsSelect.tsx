import * as React from 'react';
import { Tag, ComboBox } from '@lotta-schule/hubert';
import { useQuery } from '@apollo/client/react';

import GetTagsQuery from 'api/query/GetTagsQuery.graphql';

import styles from './TagsSelect.module.scss';

export interface TagsSelectProps {
  value: string[];
  onChange(value: string[]): void;
}

export const TagsSelect = React.memo(({ value, onChange }: TagsSelectProps) => {
  const { data, updateQuery } = useQuery<{
    tags: string[];
  }>(GetTagsQuery);

  const availableTags = [...new Set(data?.tags ?? [])];

  return (
    <div className={styles.root}>
      {value.map((tag) => (
        <Tag
          key={tag}
          onDelete={() => onChange(value.filter((t) => t !== tag))}
        >
          {tag}
        </Tag>
      ))}
      <ComboBox
        fullWidth
        additionalConfirmChars={[',', ';', '#', ' ']}
        title={'Tag hinzufügen'}
        className={styles.inputWrapper}
        items={availableTags.map((tag) => ({
          key: tag,
          label: tag,
          textValue: tag,
          selected: value.includes(tag),
        }))}
        onSelect={(tag) => {
          if (tag) {
            if (value.includes(tag.toString())) {
              onChange(value.filter((t) => t !== tag));
            } else {
              onChange([...value, tag.toString()]);
            }

            // add tag to availableTags
            if (!data?.tags.includes(tag.toString())) {
              updateQuery((previousResult) => ({
                ...previousResult,
                tags: Array.from(
                  new Set(
                    (
                      previousResult?.tags?.filter((t) => t !== undefined) ?? []
                    ).concat([tag.toString()])
                  )
                ),
              }));
            }
          }
        }}
        hideLabel
        allowsCustomValue
      />
    </div>
  );
});
TagsSelect.displayName = 'TagsSelect';
