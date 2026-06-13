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
import { SelectFileButton } from '#/shared/edit/SelectFileButton.js';
import {
  FormElement as FormElementInterface,
  FormElementOption,
} from './Form.js';
import { FileModel } from '#/model/index.js';

import { useCurrentUser } from '#/util/user/useCurrentUser.js';
import { Icon } from '#/shared/Icon.js';
import {
  faCirclePlus,
  faPencil,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import styles from './FormElement.module.scss';

export interface FormElementProps {
  element: FormElementInterface;
  isEditModeEnabled?: boolean;
  value: string | string[];
  onSetValue(value: string | string[]): void;
  onUpdateElement?(element: Partial<FormElementInterface>): void;
}

const EditableText = ({
  value,
  ariaLabel,
  onChange,
}: {
  value: string;
  ariaLabel?: string;
  onChange(value: string): void;
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [value, isEditing]);

  const commit = () => {
    setIsEditing(false);
    const next = draft.trim();
    if (next && next !== value) {
      onChange(next);
    } else {
      setDraft(value);
    }
  };

  if (isEditing) {
    return (
      <Input
        inline
        autoFocus
        className={styles.editableInput}
        aria-label={ariaLabel}
        value={draft}
        onClick={(e: any) => e.stopPropagation()}
        onChange={(e: any) => setDraft(e.currentTarget.value)}
        onBlur={commit}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            setDraft(value);
            setIsEditing(false);
          }
        }}
      />
    );
  }

  return (
    <span className={styles.editableText}>
      {value}
      <Button
        small
        className={styles.editButton}
        title={'bearbeiten'}
        icon={<Icon icon={faPencil} color={'secondary'} />}
        onClick={(e: any) => {
          e.stopPropagation();
          e.preventDefault();
          setIsEditing(true);
        }}
      />
    </span>
  );
};

export const FormElement = React.memo<FormElementProps>(
  ({ element, isEditModeEnabled, value, onSetValue, onUpdateElement }) => {
    const currentUser = useCurrentUser();
    const isEditable = !!isEditModeEnabled && !!onUpdateElement;

    const updateOption = (index: number, partial: Partial<FormElementOption>) =>
      onUpdateElement?.({
        options: element.options?.map((o, i) =>
          i === index ? { ...o, ...partial } : o
        ),
      });

    const addOption = () =>
      onUpdateElement?.({
        options: [
          ...(element.options ?? []),
          {
            label: `Option ${(element.options?.length ?? 0) + 1}`,
            value: `option${(element.options?.length ?? 0) + 1}`,
          },
        ],
      });

    const addOptionButton = (
      <Button
        small
        className={styles.addOptionButton}
        title={'Option hinzufügen'}
        icon={<Icon icon={faCirclePlus} size={'lg'} color={'secondary'} />}
        onClick={addOption}
      />
    );

    const formElement = (() => {
      const labelText = element.label ?? element.name ?? 'Beschreibung';
      // hubert's `Label` types `label` as `ReactNode & string` (it extends
      // HTMLProps), so a JSX node has to be cast through to satisfy it.
      const label = (isEditable ? (
        <EditableText
          value={labelText}
          ariaLabel={'Bezeichnung'}
          onChange={(label) => onUpdateElement!({ label })}
        />
      ) : (
        labelText
      )) as unknown as string;
      if (element.element === 'selection') {
        if (element.type === 'checkbox') {
          return (
            <Label label={label}>
              <div className={isEditable ? styles.optionList : undefined}>
                {element.options?.map((option, i) => {
                  const optionLabel = option.label ?? option.value;
                  const optionValue = option.value ?? option.label ?? i;
                  return (
                    <Checkbox
                      key={i}
                      name={element.name}
                      value={optionValue}
                      isDisabled={isEditModeEnabled}
                      aria-label={optionLabel}
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
                      {isEditable ? (
                        <EditableText
                          value={optionLabel}
                          ariaLabel={'Option'}
                          onChange={(label) => updateOption(i, { label })}
                        />
                      ) : (
                        optionLabel
                      )}
                    </Checkbox>
                  );
                })}
                {isEditable && addOptionButton}
              </div>
            </Label>
          );
        } else if (element.type === 'radio') {
          return (
            <Label label={label}>
              <div className={isEditable ? styles.optionList : undefined}>
                <RadioGroup
                  name={element.name}
                  value={value ?? ''}
                  onChange={(_e, value) => onSetValue(value)}
                  required={element.required}
                >
                  {element.options?.map((option, i) => {
                    const optionLabel = option.label ?? option.value;
                    const optionValue = option.value ?? option.label ?? i;
                    return (
                      <Radio
                        key={i}
                        name={element.name}
                        value={optionValue}
                        label={isEditable ? undefined : optionLabel}
                        aria-label={optionLabel}
                        disabled={isEditModeEnabled}
                      >
                        {isEditable && (
                          <EditableText
                            value={optionLabel}
                            ariaLabel={'Option'}
                            onChange={(label) => updateOption(i, { label })}
                          />
                        )}
                      </Radio>
                    );
                  })}
                </RadioGroup>
                {isEditable && addOptionButton}
              </div>
            </Label>
          );
        } else if (element.type === 'select') {
          const selectField = (
            <Select
              fullWidth
              title={labelText}
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
                const optionLabel = option.label ?? option.value;
                const optionValue = option.value ?? option.label ?? i;
                return (
                  <Option key={i} value={optionValue}>
                    {optionLabel}
                  </Option>
                );
              })}
            </Select>
          );
          if (!isEditable) {
            return selectField;
          }
          return (
            <Label label={label}>
              <div>
                {selectField}
                <div className={styles.optionList}>
                  {element.options?.map((option, i) => (
                    <EditableText
                      key={i}
                      value={option.label ?? option.value}
                      ariaLabel={'Option'}
                      onChange={(label) => updateOption(i, { label })}
                    />
                  ))}
                  {addOptionButton}
                </div>
              </div>
            </Label>
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
