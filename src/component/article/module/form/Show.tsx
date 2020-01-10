import React, { FormEvent, memo } from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { ContentModuleModel } from 'model';
import { FormConfiguration } from './Form';
import { FormElement } from './FormElement';
import { useMutation } from 'react-apollo';
import { SendFormResponseMutation } from 'api/mutation/SendFormResponseMutation';
import { SuccessMessage } from 'component/general/SuccessMessage';

export interface ShowProps {
    contentModule: ContentModuleModel<FormConfiguration>;
}

const useStyles = makeStyles(theme => ({
    root: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        paddingRight: theme.spacing(2),
        paddingLeft: theme.spacing(2),
    },
    submitButton: {
        float: 'right',
        marginTop: theme.spacing(2)
    }
}))

export const Show = memo<ShowProps>(({ contentModule }) => {
    const styles = useStyles();
    const [sendFormResponse, { loading: isLoading, data }] = useMutation(SendFormResponseMutation);

    const onSubmitForm = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        sendFormResponse({
            variables: {
                id: contentModule.id,
                response: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))
            }
        });
    };

    const configuration: FormConfiguration = { destination: '', elements: [], ...contentModule.configuration };

    if (data) {
        return (
            <SuccessMessage message={'Das Formular wurde erfolgreich versendet.'} />
        );
    }

    return (
        <form className={styles.root} onSubmit={onSubmitForm}>
            {configuration.elements.map((element, index) => (
                <section key={element.name || index}>
                    <FormElement element={element} />
                </section>
            ))}
            <section>
                <Button className={styles.submitButton} variant={'outlined'} color={'primary'} type={'submit'} disabled={isLoading}>
                    Senden
                </Button>
            </section>
        </form>
    );

});