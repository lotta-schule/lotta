import * as React from 'react';
import { get } from 'lodash';
import { Theme } from '@material-ui/core/styles';
import { BaseButton } from 'shared/general/button/BaseButton';

import styles from './SelectTemplateButton.module.scss';

export interface SelectTemplateButtonProps {
    title: string;
    theme: Partial<Theme>;
    onClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const SelectTemplateButton = React.memo<SelectTemplateButtonProps>(
    ({ title, theme: partialTheme, onClick }) => {
        const getBackground = (): React.CSSProperties['background'] => {
            const primaryColor: string = get(
                partialTheme,
                'palette.primary.main',
                get(partialTheme, 'palette.primary.main')
            );
            const navigationBackgroundColor: string = get(
                partialTheme,
                'palette.secondary.main',
                get(partialTheme, 'palette.secondary.main')
            );
            const backgroundColor: string = get(
                partialTheme,
                'palette.background.paper',
                get(partialTheme, 'palette.background.paper')
            );
            return `linear-gradient(${[
                `${primaryColor} 33%`,
                `${navigationBackgroundColor} 33%`,
                `${navigationBackgroundColor} 66%`,
                `${backgroundColor} 66%`,
            ].join(', ')})`;
        };

        return (
            <BaseButton
                style={{ background: getBackground() }}
                className={styles.root}
                onClick={onClick}
            >
                <span className={styles.imageButton}>
                    <span className={styles.imageTitle}>{title}</span>
                </span>
            </BaseButton>
        );
    }
);
SelectTemplateButton.displayName = 'SelectTemplateButton';
