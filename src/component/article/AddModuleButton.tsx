import React, { memo, MouseEventHandler } from 'react';
import { Button } from 'component/general/button/Button';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
    },
}));

export interface AddModuleButtonProps {
    label: string;
    icon?: any;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const AddModuleButton = memo<AddModuleButtonProps>(
    ({ label, icon, onClick }) => {
        const styles = useStyles();

        return (
            <Button className={styles.root} onClick={onClick}>
                {icon}
                <Typography>{label}</Typography>
            </Button>
        );
    }
);
