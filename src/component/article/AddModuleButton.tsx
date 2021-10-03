import * as React from 'react';
import { Button } from 'component/general/button/Button';

import styles from './AddModuleButton.module.scss';

export interface AddModuleButtonProps {
    label: string;
    icon?: any;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const AddModuleButton = React.memo<AddModuleButtonProps>(
    ({ label, icon, onClick }) => {
        return (
            <Button className={styles.root} onClick={onClick}>
                {icon}
                <div>{label}</div>
            </Button>
        );
    }
);
AddModuleButton.displayName = 'AddModuleButton';
