import React, { memo } from 'react';
import { Toolbar, createStyles, makeStyles, Theme } from '@material-ui/core';
import { ToggleButtonGroup } from '@material-ui/lab';
import { FormatBold, FormatItalic, FormatUnderlined, FormatListBulleted, FormatListNumbered, ArrowDropDown } from '@material-ui/icons';
import { useFocused } from 'slate-react';
import { EditToolbarMarkButton } from './EditToolbarMarkButton';
import { EditToolbarLinkButton } from './EditToolbarLinkButton';
import { EditToolbarBlockButton } from './EditToolbarBlockButton';
import { EditToolbarImageButton } from './EditToolbarImageButton';
import { useSpring, animated } from 'react-spring'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: {
            position: 'sticky',
            top: 64,
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(1)
        },
        toolbarButtonGroup: {
            marginRight: theme.spacing(.5),
        },
    })
);

export interface EditToolbarProps {
    onRequestSave?(): void;
}

const AnimatedToolbar = animated(Toolbar);

export const EditToolbar = memo<EditToolbarProps>(({ onRequestSave }) => {
    const isFocused = useFocused();

    const props = useSpring({ maxHeight: isFocused ? 64 : 0, opacity: isFocused ? 1 : 0, tension: 2000, mass: .5, friction: 15 })
    const styles = useStyles();

    return (
        <AnimatedToolbar style={props} className={styles.toolbar}>
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
                <EditToolbarImageButton onImageAdded={onRequestSave} />
            </ToggleButtonGroup>
            &nbsp;
            <ToggleButtonGroup className={styles.toolbarButtonGroup} size={'small'} value={'none'}>
                <EditToolbarMarkButton mark={'small'}>
                    <ArrowDropDown />
                </EditToolbarMarkButton>
            </ToggleButtonGroup>
            &nbsp;
        </AnimatedToolbar>
    );
});
