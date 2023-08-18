import * as React from 'react';
import { BaseButton, useTheme } from '@lotta-schule/hubert';

import styles from './SelectTemplateButton.module.scss';

export interface SelectTemplateButtonProps {
    title: string;
    theme: Partial<ReturnType<typeof useTheme>>;
    onClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const SelectTemplateButton = React.memo<SelectTemplateButtonProps>(
    ({ title, theme, onClick }) => {
        const getBackground = (): React.CSSProperties['background'] => {
            return `linear-gradient(${[
                `${theme.primaryColor} 33%`,
                `${theme.navigationBackgroundColor} 33%`,
                `${theme.navigationBackgroundColor} 66%`,
                `${theme.pageBackgroundColor} 66%`,
            ].join(', ')})`;
        };

        return (
            <BaseButton
                style={{ background: getBackground() }}
                className={styles.root}
                onClick={onClick}
            >
                <span className={styles.imageButton}>
                    <span
                        style={{ color: theme.contrastTextColor }}
                        className={styles.imageTitle}
                    >
                        {title}
                    </span>
                </span>
            </BaseButton>
        );
    }
);
SelectTemplateButton.displayName = 'SelectTemplateButton';
