import * as React from 'react';
import { Button } from '@lotta-schule/hubert';
import { FormResultsDialog } from './FormResultsDialog';
import { Show } from './Show';
import { Edit } from './Edit';
import { faInbox } from '@fortawesome/free-solid-svg-icons';
import { Icon } from 'shared/Icon';
import { ContentModuleComponentProps } from '../ContentModule';

export interface FormElementOption {
  selected?: boolean;
  value: string;
  label?: string;
}

export interface FormElement {
  element: 'input' | 'selection' | 'file';
  name: string;
  type?: string;
  label?: string;
  descriptionText?: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  options?: FormElementOption[];
}

export interface FormConfiguration {
  destination?: string;
  save_internally?: boolean;
  elements: FormElement[];
}

export const Form = React.memo(
  ({
    contentModule,
    isEditModeEnabled,
    userCanEditArticle,
    onUpdateModule,
  }: ContentModuleComponentProps) => {
    const [isFormResultsDialogOpen, setIsFormResultsDialogOpen] =
      React.useState(false);
    return (
      <div data-testid="FormContentModule">
        {isEditModeEnabled && onUpdateModule && (
          <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
        )}
        {!isEditModeEnabled && <Show contentModule={contentModule} />}
        {userCanEditArticle && (
          <>
            <Button
              onClick={() => setIsFormResultsDialogOpen(true)}
              icon={<Icon icon={faInbox} size={'lg'} />}
              style={{
                margin: '0 auto',
              }}
              variant={'fill'}
            >
              Formulareinsendungen sehen
            </Button>
            <FormResultsDialog
              contentModule={contentModule}
              isOpen={isFormResultsDialogOpen}
              onRequestClose={() => setIsFormResultsDialogOpen(false)}
            />
          </>
        )}
      </div>
    );
  }
);
Form.displayName = 'Form';
