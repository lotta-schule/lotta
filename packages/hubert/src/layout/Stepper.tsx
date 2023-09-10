import * as React from 'react';
import { KeyboardArrowLeft, KeyboardArrowRight } from '../icon';
import { NavigationButton } from '../button';
import clsx from 'clsx';

import styles from './Stepper.module.scss';

export type StepperProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  style?: React.CSSProperties;
  maxSteps: number;
  currentStep: number;
  onStep: (_newStep: number) => void;
};

export const Stepper = React.memo(
  ({
    className,
    currentStep,
    maxSteps,
    style,
    onStep,
    ...props
  }: StepperProps) => {
    const ariaAttrs: React.AriaAttributes = {
      'aria-valuemin': 1,
      'aria-valuemax': maxSteps,
      'aria-valuenow': currentStep + 1,
    };
    return (
      <div
        role="spinbutton"
        {...ariaAttrs}
        className={clsx(styles.root, className)}
        style={style}
        {...props}
      >
        <NavigationButton
          small
          icon={<KeyboardArrowLeft />}
          onClick={() => onStep(currentStep - 1)}
          disabled={currentStep <= 0}
          aria-label={'Vorheriger Schritt'}
          style={{ color: 'rgba(var(--lotta-text-color), 1)' }}
        >
          vorheriges
        </NavigationButton>
        <div>
          {currentStep + 1} / {maxSteps}
        </div>
        <NavigationButton
          small
          icon={<KeyboardArrowRight />}
          onClick={() => onStep(currentStep + 1)}
          disabled={currentStep >= maxSteps - 1}
          aria-label={'Nächster Schritt'}
          style={{ color: 'rgba(var(--lotta-text-color), 1)' }}
        >
          nächstes
        </NavigationButton>
      </div>
    );
  }
);
Stepper.displayName = 'Stepper';
