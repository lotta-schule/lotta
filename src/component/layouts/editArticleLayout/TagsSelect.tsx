import * as React from 'react';
import { CircularProgress, Input } from '@material-ui/core';
import { useAutocomplete } from '@material-ui/lab';
import { useLazyQuery } from '@apollo/client';
import { GetTagsQuery } from 'api/query/GetTagsQuery';
import { Tag } from 'component/general/tag/Tag';

export interface TagsSelectProps {
    value: string[];
    onChange(value: string[]): void;
}

export const TagsSelect = React.memo<TagsSelectProps>(({ value, onChange }) => {
    const [searchtext, setSearchtext] = React.useState('');
    const [loadTags, { called, loading: isLoading, data }] = useLazyQuery<{
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
            onChange(value);
        },
        onClose: (_event, reason) => {
            if (reason === 'blur') {
                setSearchtext('');
            }
        },
    });

    return (
        <div id={'tags-select'} {...getRootProps()}>
            {value.map((tag, index) => (
                <Tag
                    {...getOptionProps({ option: tag, index })}
                    onDelete={() => onChange(value.filter((v) => v !== tag))}
                >
                    {tag}
                </Tag>
            ))}

            <div
                ref={setAnchorEl}
                style={{
                    position: 'relative',
                    display: 'inline-flex',
                    flexWrap: 'wrap',
                    width: '8em',
                    flexShrink: 0,
                }}
            >
                <Input
                    {...getInputProps()}
                    fullWidth
                    disableUnderline
                    placeholder={'Tag hinzufügen'}
                    onBlur={(e) => {
                        if (e.target.value) {
                            onChange([...value, e.target.value]);
                        }
                    }}
                    inputProps={{
                        'aria-label': 'Tag hinzufügen',
                    }}
                    endAdornment={
                        <>
                            {isLoading ? (
                                <CircularProgress color={'inherit'} size={20} />
                            ) : null}
                            {(getInputProps() as any).endAdornment}
                        </>
                    }
                />
                {groupedOptions.length > 0 ? (
                    <ul
                        data-testid="TagsSelectCombobox"
                        style={{
                            position: 'absolute',
                            top: '2em',
                            backgroundColor: '#fff',
                            width: '100%',
                        }}
                        {...getListboxProps()}
                    >
                        {groupedOptions.map((option, index) => (
                            <li {...getOptionProps({ option, index })}>
                                {option}
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </div>
    );
});
