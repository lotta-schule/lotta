import * as React from 'react';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { NavigationButton } from '../button/NavigationButton';
import clsx from 'clsx';

import styles from './Stepper.module.scss';

export interface StepperProps {
    className?: string;
    style?: React.CSSProperties;
    maxSteps: number;
    currentStep: number;
    onStep: (newStep: number) => void;
}

export const Stepper = React.memo<StepperProps>(
    ({ className, currentStep, maxSteps, style, onStep }) => {
        return (
            <div className={clsx(styles.root, className)} style={style}>
                <NavigationButton
                    small
                    icon={<KeyboardArrowLeft />}
                    onClick={() => onStep(currentStep - 1)}
                    disabled={currentStep <= 0}
                    aria-label={'Vorheriger Schritt'}
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
                >
                    nächstes
                </NavigationButton>
            </div>
        );
    }
);
Stepper.displayName = 'Stepper';
