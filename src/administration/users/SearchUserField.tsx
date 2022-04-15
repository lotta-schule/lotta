import * as React from 'react';
import { NoSsr } from 'shared/general/util/NoSsr';
import { useAutocomplete } from '@material-ui/lab';
import { useLazyQuery } from '@apollo/client';
import { useDebounce } from 'util/useDebounce';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { UserModel } from 'model';
import { Input } from 'shared/general/form/input/Input';
import { CircularProgress } from 'shared/general/progress/CircularProgress';
import SearchUsersQuery from 'api/query/SearchUsersQuery.graphql';
import clsx from 'clsx';

import styles from './SearchUserField.module.scss';

export interface SearchUserFieldProps {
    className?: string;
    label?: string | null;
    disabled?: boolean;
    style?: React.CSSProperties;
    onSelectUser(user: UserModel): void;
}

export const SearchUserField = React.memo<SearchUserFieldProps>(
    ({ className, label, disabled, style, onSelectUser }) => {
        const [searchtext, setSearchtext] = React.useState('');
        const [execute, { data, loading: isLoading }] = useLazyQuery<
            { users: UserModel[] },
            { searchtext: string }
        >(SearchUsersQuery);
        const debouncedSearchtext = useDebounce(searchtext, 500);
        const selectUser = (user: UserModel | null) => {
            if (user) {
                onSelectUser(user);
            }
            setSearchtext('');
        };

        React.useEffect(() => {
            if (debouncedSearchtext.length >= 2) {
                execute({ variables: { searchtext: debouncedSearchtext } });
            }
        }, [debouncedSearchtext, execute]);

        const {
            getRootProps,
            getInputLabelProps,
            getInputProps,
            getListboxProps,
            getOptionProps,
            groupedOptions,
            focused,
            setAnchorEl,
        } = useAutocomplete({
            id: 'user-select',
            value: null,
            inputValue: searchtext,
            options: data?.users ?? [],
            getOptionLabel: (option) => option.nickname || option.name || '',
            getOptionSelected: (_option, _value) => false,
            filterOptions: (options, _state) => options,
            onInputChange: (_event, value, reason) => {
                if (reason !== 'reset') {
                    setSearchtext(value);
                }
            },
            onChange: (_event, value, _reason, _details) => {
                selectUser(value);
            },
            onClose: (_event, reason) => {
                if (reason === 'blur') {
                    setSearchtext('');
                }
            },
        });

        return (
            <NoSsr>
                <div
                    className={clsx(styles.root, className)}
                    style={style}
                    data-testid="SearchUserField"
                >
                    <div
                        {...getRootProps()}
                        data-testid="SearchUserFieldSelection"
                    >
                        <label
                            htmlFor={'search-userAvatar-input-field'}
                            {...getInputLabelProps()}
                        >
                            {label || 'Nutzer suchen:'}
                        </label>
                        <div
                            ref={setAnchorEl}
                            className={clsx(styles.inputWrapper, { focused })}
                        >
                            <Input
                                id={'search-userAvatar-input-field'}
                                disabled={disabled}
                                placeholder={'Nutzer suchen ...'}
                                {...getInputProps()}
                            />
                            {isLoading && (
                                <CircularProgress
                                    isIndeterminate
                                    aria-label={'Ergebnisse werden geladen'}
                                    className={styles.inputLoading}
                                    size={20}
                                />
                            )}
                        </div>
                    </div>
                    {groupedOptions.length > 0 ? (
                        <ul
                            className={styles.listBox}
                            data-testid="UserSearchSelection"
                            {...getListboxProps()}
                        >
                            {groupedOptions.map((option, index) => (
                                <li
                                    key={index}
                                    {...getOptionProps({ option, index })}
                                >
                                    <UserAvatar
                                        className={styles.avatar}
                                        style={{ width: '2em', height: '2em' }}
                                        user={option}
                                        size={40}
                                    />
                                    <div>
                                        {option.name && (
                                            <>
                                                {option.name}&nbsp;(
                                                <strong>
                                                    {option.nickname}
                                                </strong>
                                                )
                                            </>
                                        )}
                                        {!option.name && option.nickname && (
                                            <strong>{option.nickname}</strong>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            </NoSsr>
        );
    }
);
SearchUserField.displayName = 'SearchUserField';
