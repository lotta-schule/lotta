import React, { memo } from 'react';
import { Toolbar, Collapse, createStyles, makeStyles, Theme } from '@material-ui/core';
import { ToggleButtonGroup } from '@material-ui/lab';
import { FormatBold, FormatItalic, FormatUnderlined, FormatListBulleted, FormatListNumbered, ArrowDropDown } from '@material-ui/icons';
import { useFocused } from 'slate-react';
import { EditToolbarMarkButton } from './EditToolbarMarkButton';
import { EditToolbarLinkButton } from './EditToolbarLinkButton';
import { EditToolbarBlockButton } from './EditToolbarBlockButton';
import { EditToolbarImageButton } from './EditToolbarImageButton';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: {
            padding: 0,
        },
        toolbarButtonGroup: {
            marginRight: theme.spacing(1),
        },
    })
);

export const EditToolbar = memo(() => {
    const isFocused = useFocused();

    const styles = useStyles();

    return (
        <Collapse in={isFocused}>
            <Toolbar className={styles.toolbar}>
                <ToggleButtonGroup className={styles.toolbarButtonGroup} size={'small'} value={false}>
                    <EditToolbarMarkButton mark={'bold'}>
                        <FormatBold />
                    </EditToolbarMarkButton>
                    <EditToolbarMarkButton mark={'italic'}>
                        <FormatItalic />
                    </EditToolbarMarkButton>
                    <EditToolbarMarkButton mark={'underline'}>
                        <FormatUnderlined />
                    </EditToolbarMarkButton>
                </ToggleButtonGroup>
                &nbsp;
                <ToggleButtonGroup className={styles.toolbarButtonGroup} size={'small'} value={'none'}>
                    <EditToolbarLinkButton />
                </ToggleButtonGroup>
                &nbsp;
                <ToggleButtonGroup className={styles.toolbarButtonGroup} size={'small'} value={'none'}>
                    <EditToolbarBlockButton mark={'unordered-list'}>
                        <FormatListBulleted />
                    </EditToolbarBlockButton>
                    <EditToolbarBlockButton mark={'ordered-list'}>
                        <FormatListNumbered />
                    </EditToolbarBlockButton>
                </ToggleButtonGroup>
                &nbsp;
                <ToggleButtonGroup className={styles.toolbarButtonGroup} size={'small'} value={'none'}>
                    <EditToolbarImageButton />
                </ToggleButtonGroup>
                &nbsp;
                <ToggleButtonGroup className={styles.toolbarButtonGroup} size={'small'} value={'none'}>
                    <EditToolbarMarkButton mark={'small'}>
                        <ArrowDropDown />
                    </EditToolbarMarkButton>
                </ToggleButtonGroup>
                &nbsp;
            </Toolbar>
        </Collapse>
    );
});