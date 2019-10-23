import React, { FunctionComponent, memo, MouseEventHandler } from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme, Typography, Button } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2),
        textAlign: 'center',
        backgroundColor: theme.palette.primary.contrastText,
        color: theme.palette.secondary.main,
        borderColor: theme.palette.secondary.main,
        borderRadius: 4,
        border: '1px solid',
        '&:hover': {
            backgroundColor: theme.palette.secondary.light,
        }
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
        <Button classes={{ root: styles.root, label: styles.buttonLabel }} onClick={onClick}>
            {icon}
            <Typography>{label}</Typography>
        </Button>
    );
});