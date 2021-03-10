import React, {
    FormEvent,
    memo,
    useState,
    useEffect,
    useRef,
    useMemo,
} from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { ContentModuleModel } from 'model';
import { FormConfiguration } from './Form';
import { FormElement } from './FormElement';
import { useMutation } from '@apollo/client';
import { SendFormResponseMutation } from 'api/mutation/SendFormResponseMutation';
import { SuccessMessage } from 'component/general/SuccessMessage';

export interface ShowProps {
    contentModule: ContentModuleModel<{}, FormConfiguration>;
}

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        paddingRight: theme.spacing(2),
        paddingLeft: theme.spacing(2),
        margin: '0 16.6%',
        [theme.breakpoints.down('sm')]: {
            margin: 0,
        },
    },
    submitButton: {
        float: 'right',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    formElement: {
        marginBottom: theme.spacing(2),
    },
}));

export const Show = memo<ShowProps>(({ contentModule }) => {
    const styles = useStyles();
    const [sendFormResponse, { loading: isLoading, data }] = useMutation(
        SendFormResponseMutation
    );
    const configuration: FormConfiguration = useMemo(
        () => ({
            destination: '',
            elements: [],
            ...contentModule.configuration,
        }),
        [contentModule.configuration]
    );
    const [formData, setFormData] = useState<any>({});
    const formRef = useRef<HTMLFormElement | null>(null);

    useEffect(() => {
        // find initial data
        setFormData(
            configuration.elements.reduce(
                (data, element) => ({
                    ...data,
                    [element.name]:
                        (element.element === 'selection' &&
                            (element.type === 'checkbox'
                                ? element.options
                                      ?.filter((op) => op.selected)
                                      ?.map((op) => op.value)
                                : element.options?.find((op) => op.selected)
                                      ?.value)) ||
                        (element.type === 'checkbox' ? [] : ''),
                }),
                {}
            )
        );
    }, [configuration.elements]);

    const isValid = useMemo(() => {
        return configuration.elements
            .filter((el) => el.required)
            .map((el) => formData[el.name!] && formData[el.name!].length)
            .every((el) => Boolean(el));
    }, [configuration.elements, formData]);

    const onSubmitForm = async (e: FormEvent<HTMLFormElement>) => {
        const blobTob64 = async (blobUrl: string) => {
            const blob = await fetch(blobUrl).then((r) => r.blob());
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;

                reader.readAsDataURL(blob);
            });
        };
        e.preventDefault();
        const transformedResponse: Record<string, string | string[]> = {};
        const blobUrlsToDispense: string[] = [];
        for (const key in formData) {
            let value = formData[key];
            if (typeof value === 'string') {
                const matches = value.match(/^file-upload:\/\/(.+)/);
                if (matches && matches.length > 1) {
                    const file = JSON.parse(matches[1]);
                    value = `file-upload://${JSON.stringify({
                        ...file,
                        data: await blobTob64(file.blob),
                    })}`;
                    blobUrlsToDispense.push(file.blob);
                }
            }
            transformedResponse[key] = value;
        }
        sendFormResponse({
            variables: {
                id: contentModule.id,
                response: JSON.stringify(transformedResponse),
            },
            update() {
                blobUrlsToDispense.forEach((url) => URL.revokeObjectURL(url));
            },
        });
    };

    if (data) {
        return (
            <SuccessMessage
                message={'Das Formular wurde erfolgreich versendet.'}
            />
        );
    }

    return (
        <form className={styles.root} onSubmit={onSubmitForm} ref={formRef}>
            {configuration.elements.map((element, index) => (
                <section
                    key={element.name || index}
                    className={styles.formElement}
                >
                    <FormElement
                        element={element}
                        value={formData[element.name]}
                        onSetValue={(v) =>
                            setFormData({ ...formData, [element.name]: v })
                        }
                    />
                </section>
            ))}
            <section>
                <Button
                    className={styles.submitButton}
                    variant={'outlined'}
                    color={'primary'}
                    type={'submit'}
                    disabled={!isValid || isLoading}
                >
                    Senden
                </Button>
            </section>
        </form>
    );
});
