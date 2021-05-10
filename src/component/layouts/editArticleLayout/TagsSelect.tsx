import * as React from 'react';
import { CircularProgress, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { useLazyQuery } from '@apollo/client';
import { GetTagsQuery } from 'api/query/GetTagsQuery';

export interface TagsSelectProps {
    value: string[];
    onChange(value: string[]): void;
}

export const TagsSelect = React.memo<TagsSelectProps>(({ value, onChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [options, setOptions] = React.useState<string[]>([]);

    const [
        loadTopics,
        { called: isCalled, loading: isLoading, data },
    ] = useLazyQuery<{ tags: string[] }>(GetTagsQuery);

    React.useEffect(() => {
        if (isOpen && !isCalled) {
            loadTopics();
        }
    }, [isCalled, isOpen, loadTopics]);

    React.useEffect(() => {
        if (isOpen && data?.tags) {
            setOptions(data.tags);
        } else {
            setOptions([]);
        }
    }, [isOpen, data]);

    return (
        <Autocomplete
            id={'tags-select'}
            open={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            onChange={(_e: React.ChangeEvent<{}>, value: string[]) => {
                onChange(value);
            }}
            value={value}
            freeSolo
            multiple
            options={options}
            loading={isLoading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    fullWidth
                    label={'Tags'}
                    variant={'outlined'}
                    onBlur={(e) => {
                        if (e.target.value) {
                            onChange([...value, e.target.value]);
                        }
                    }}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {isLoading ? (
                                    <CircularProgress
                                        color={'inherit'}
                                        size={20}
                                    />
                                ) : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
});
