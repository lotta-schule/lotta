import * as React from 'react';
import { ContentModuleModel } from 'model';
import { FormConfiguration } from './Form';
import { FormElement } from './FormElement';
import { useMutation } from '@apollo/client/react';
import { Button, SuccessMessage } from '@lotta-schule/hubert';
import SendFormResponseMutation from 'api/mutation/SendFormResponseMutation.graphql';

import styles from './Show.module.scss';

export interface ShowProps {
  contentModule: ContentModuleModel<Record<string, string>, FormConfiguration>;
}

export const Show = React.memo<ShowProps>(({ contentModule }) => {
  const [sendFormResponse, { loading: isLoading, data }] = useMutation(
    SendFormResponseMutation
  );
  const configuration: FormConfiguration = React.useMemo(
    () => ({
      destination: '',
      elements: [],
      ...contentModule.configuration,
    }),
    [contentModule.configuration]
  );
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const formRef = React.useRef<HTMLFormElement | null>(null);

  React.useEffect(() => {
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
                : element.options?.find((op) => op.selected)?.value)) ||
            (element.type === 'checkbox' ? [] : ''),
        }),
        {}
      )
    );
  }, [configuration.elements]);

  const isValid = React.useMemo(() => {
    return configuration.elements
      .filter((el) => el.required)
      .map((el) => formData[el.name!] && formData[el.name!].length)
      .every((el) => Boolean(el));
  }, [configuration.elements, formData]);

  const onSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
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
      <SuccessMessage message={'Das Formular wurde erfolgreich versendet.'} />
    );
  }

  return (
    <form className={styles.root} onSubmit={onSubmitForm} ref={formRef}>
      {configuration.elements.map((element, index) => (
        <section key={element.name || index} className={styles.formElement}>
          <FormElement
            element={element}
            value={formData[element.name]}
            onSetValue={(v) =>
              setFormData({ ...formData, [element.name]: v as string })
            }
          />
        </section>
      ))}
      <section style={{ overflow: 'auto' }}>
        <Button
          className={styles.submitButton}
          type={'submit'}
          disabled={!isValid || isLoading}
        >
          Senden
        </Button>
      </section>
    </form>
  );
});
Show.displayName = 'FormContentModuleShow';
