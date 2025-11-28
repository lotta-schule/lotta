import * as React from 'react';
import {
  Button,
  ButtonGroup,
  Checkbox,
  Input,
  Label,
  Radio,
  RadioGroup,
  Option,
  Select,
} from '@lotta-schule/hubert';
import { SelectFileButton } from 'shared/edit/SelectFileButton';
import { FormElement as FormElementInterface } from './Form';
import { FileModel } from 'model';

import { useCurrentUser } from 'util/user/useCurrentUser';
import { Icon } from 'shared/Icon';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export interface FormElementProps {
  element: FormElementInterface;
  isEditModeEnabled?: boolean;
  value: string | string[];
  onSetValue(value: string | string[]): void;
}

export const FormElement = React.memo<FormElementProps>(
  ({ element, isEditModeEnabled, value, onSetValue }) => {
    const currentUser = useCurrentUser();
    const formElement = (() => {
      const label = element.label ?? element.name ?? 'Beschreibung';
      if (element.element === 'selection') {
        if (element.type === 'checkbox') {
          return (
            <Label label={label}>
              <div>
                {element.options?.map((option, i) => {
                  const label = option.label ?? option.value;
                  const optionValue = option.value ?? option.label ?? i;
                  return (
                    <Checkbox
                      key={i}
                      name={element.name}
                      value={optionValue}
                      isDisabled={isEditModeEnabled}
                      aria-label={label}
                      isSelected={
                        value instanceof Array
                          ? value.indexOf(optionValue) > -1
                          : false
                      }
                      onChange={(isSelected) => {
                        const values = (
                          value instanceof Array ? value : [value]
                        ).filter(Boolean);
                        if (isSelected) {
                          onSetValue([...values, option.value]);
                        } else {
                          onSetValue(values.filter((v) => v !== option.value));
                        }
                      }}
                    >
                      {label}
                    </Checkbox>
                  );
                })}
              </div>
            </Label>
          );
        } else if (element.type === 'radio') {
          return (
            <Label label={label}>
              <div>
                <RadioGroup
                  name={element.name}
                  value={value ?? ''}
                  onChange={(_e, value) => onSetValue(value)}
                  required={element.required}
                >
                  {element.options?.map((option, i) => {
                    const label = option.label ?? option.value;
                    const value = option.value ?? option.label ?? i;
                    return (
                      <Radio
                        key={i}
                        name={element.name}
                        value={value}
                        label={label}
                        disabled={isEditModeEnabled}
                      />
                    );
                  })}
                </RadioGroup>
              </div>
            </Label>
          );
        } else if (element.type === 'select') {
          return (
            <Select
              fullWidth
              title={label}
              value={
                (value as string) ??
                element.options?.find((o) => o.selected)?.value ??
                ''
              }
              onChange={(value) => onSetValue(value)}
              required={element.required}
              id={`form-select-${element.name!}`}
            >
              {element.options?.map((option, i) => {
                const label = option.label ?? option.value;
                const value = option.value ?? option.label ?? i;
                return (
                  <Option key={i} value={value}>
                    {label}
                  </Option>
                );
              })}
            </Select>
          );
        }
      }
      if (element.element === 'input') {
        return (
          <Label label={label}>
            <Input
              disabled={isEditModeEnabled}
              name={element.name}
              type={element.type}
              placeholder={element.placeholder}
              required={element.required}
              multiline={element.multiline}
              rows={element.rows ?? 4}
              value={value ?? ''}
              onChange={(e: any) => onSetValue(e.currentTarget.value)}
              aria-label={
                element.label ?? element.descriptionText ?? element.name
              }
            />
          </Label>
        );
      }
      if (element.element === 'file') {
        const maxSize = 15 * 1024 * 1024; // 15 MB
        return (
          <>
            <ButtonGroup style={{ width: '100%' }}>
              <Button style={{ flex: '0 0 50%' }}>
                <input
                  type={'file'}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                  onChange={(e) => {
                    const file = e.target.files?.item(0);
                    if (file) {
                      if (file.size > maxSize) {
                        alert(
                          `Die Datei ist zu groß. Die Datei darf höchstens 15 MB groß sein.`
                        );
                      } else {
                        onSetValue(
                          `file-upload://${JSON.stringify({
                            filesize: file.size,
                            filename: file.name,
                            filetype: file.type,
                            blob: URL.createObjectURL(file),
                          })}`
                        );
                      }
                    }
                  }}
                />
                {element.label || 'Datei hochladen'}
              </Button>
              {currentUser && (
                <SelectFileButton
                  label={`Aus 'Meine Dateien' wählen`}
                  buttonComponentProps={{
                    style: { flex: '0 0 50%' },
                    variant: 'contained',
                    color: 'primary',
                  }}
                  onSelect={(file: FileModel) => {
                    if (!file.filesize || file.filesize > maxSize) {
                      alert(
                        `Die Datei ist zu groß. Die Datei darf höchstens ${
                          maxSize / 1024
                        } MB groß sein.`
                      );
                    } else {
                      const sanitizeObject = (obj: any): any => {
                        if (typeof obj !== 'object' || obj === null) {
                          return obj;
                        }
                        return Object.fromEntries(
                          Object.entries(obj)
                            .filter(
                              ([key]) =>
                                !['formats', 'metadata', '__typename'].includes(
                                  key
                                )
                            )
                            .map(([key, value]) => [key, sanitizeObject(value)])
                        );
                      };
                      onSetValue(
                        `lotta-file-id://${JSON.stringify(sanitizeObject(file))}`
                      );
                    }
                  }}
                />
              )}
            </ButtonGroup>
            {!value && (
              <p style={{ marginTop: 0, textAlign: 'right' }}>
                <small>max. Dateigröße: {maxSize / (1024 * 1024)}MB</small>
              </p>
            )}
            {value && /^lotta-file-id:\/\/.+/.test(value as string) && (
              <p style={{ paddingLeft: '1.5em' }}>
                &nbsp;
                {
                  JSON.parse(
                    (value as string).replace(/^lotta-file-id:\/\//, '')
                  ).filename
                }
                <Button
                  title={'Auswahl entfernen'}
                  onClick={() => onSetValue('')}
                  icon={<Icon icon={faXmark} size={'lg'} />}
                />
              </p>
            )}
            {value && /^file-upload:\/\/.+/.test(value as string) && (
              <p style={{ paddingLeft: '1.5em' }}>
                &nbsp;
                {
                  JSON.parse((value as string).replace(/^file-upload:\/\//, ''))
                    .filename
                }
                <Button
                  title={'Auswahl entfernen'}
                  onClick={() => onSetValue('')}
                  icon={<Icon icon={faXmark} size={'lg'} />}
                />
              </p>
            )}
          </>
        );
      }
    })();
    if (formElement) {
      return (
        <section>
          {element.descriptionText && <p>{element.descriptionText}</p>}
          {formElement}
        </section>
      );
    }
    return null;
  }
);
FormElement.displayName = 'FormElement';
