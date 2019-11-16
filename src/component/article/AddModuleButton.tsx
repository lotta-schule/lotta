import React, { FunctionComponent, memo, MouseEventHandler } from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme, Typography, Button } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    buttonLabel: {
        display: 'flex',
        flexDirection: 'column'
    }
}));

export interface AddModuleButtonProps {
    label: string;
    icon?: any;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const AddModuleButton: FunctionComponent<AddModuleButtonProps> = memo(({ label, icon, onClick }) => {

    const styles = useStyles();

    return (
        <Button color={'secondary'} variant={'outlined'} classes={{ root: styles.root, label: styles.buttonLabel }} onClick={onClick}>
            {icon}
            <Typography>{label}</Typography>
        </Button>
    );
});