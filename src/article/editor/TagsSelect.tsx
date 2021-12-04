import * as React from 'react';
import { useAutocomplete } from '@material-ui/lab';
import { useLazyQuery } from '@apollo/client';
import { Tag } from 'shared/general/tag/Tag';
import { Input } from 'shared/general/form/input/Input';
import uniq from 'lodash/uniq';

import GetTagsQuery from 'api/query/GetTagsQuery.graphql';

import styles from './TagsSelect.module.scss';

export interface TagsSelectProps {
    value: string[];
    onChange(value: string[]): void;
}

export const TagsSelect = React.memo<TagsSelectProps>(({ value, onChange }) => {
    const [searchtext, setSearchtext] = React.useState('');
    const [loadTags, { called, data }] = useLazyQuery<{
        tags: string[];
    }>(GetTagsQuery);

    const options = data?.tags ?? [];

    React.useEffect(() => {
        if (searchtext && !called) {
            loadTags();
        }
    }, [called, searchtext, loadTags]);

    const {
        getRootProps,
        getInputProps,
        getListboxProps,
        getOptionProps,
        groupedOptions,
        setAnchorEl,
    } = useAutocomplete({
        value,
        options,
        freeSolo: true,
        multiple: true,
        id: 'tags-select',
        inputValue: searchtext,
        filterOptions: (options, { inputValue }) =>
            options.filter((option) => option.includes(inputValue)),
        getOptionLabel: (option) => option,
        getOptionSelected: (option, value) => option === value,
        onInputChange: (_event, value, reason) => {
            if (reason !== 'reset') {
                setSearchtext(value);
            }
        },
        onChange: (_event, value, _reason, _details) => {
            setSearchtext('');
            onChangeFn(value);
        },
        onClose: (_event, reason) => {
            console.log(reason);
            if (reason === 'blur') {
                setSearchtext('');
            }
        },
    });

    const onChangeFn = (tags: string[]) => {
        onChange(uniq(tags));
    };

    return (
        <div id={'tags-select'} {...getRootProps()} className={styles.root}>
            {value.map((tag, index) => {
                const onDelete = () => onChange(value.filter((v) => v !== tag));
                return (
                    <Tag
                        key={tag}
                        {...getOptionProps({ option: tag, index })}
                        onClick={onDelete}
                        onDelete={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        {tag}
                    </Tag>
                );
            })}

            <div ref={setAnchorEl} className={styles.inputWrapper}>
                <Input
                    {...getInputProps()}
                    placeholder={'Tag hinzufügen'}
                    aria-label={'Tag hinzufügen'}
                />
                {groupedOptions.length > 0 ? (
                    <ul
                        data-testid={'TagsSelectCombobox'}
                        className={styles.suggestionsList}
                        {...getListboxProps()}
                    >
                        {groupedOptions.map((option, index) => (
                            <li
                                key={option}
                                {...getOptionProps({ option, index })}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </div>
    );
});
TagsSelect.displayName = 'TagsSelect';
