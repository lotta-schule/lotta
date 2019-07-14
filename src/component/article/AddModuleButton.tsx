import React, { FunctionComponent, memo, MouseEventHandler } from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2),
        textAlign: 'center',
        backgroundColor: '#fff',
        color: theme.palette.secondary.main,
        borderColor: theme.palette.secondary.main,
        borderRadius: 4,
        border: '1px solid',
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
        <button className={styles.root} onClick={onClick}>
            {icon}
            <Typography>{label}</Typography>
        </button>
    );
});