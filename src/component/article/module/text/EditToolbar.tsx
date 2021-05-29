import * as React from 'react';
import { Toolbar, createStyles, makeStyles, Theme } from '@material-ui/core';
import {
    FormatBold,
    FormatItalic,
    FormatUnderlined,
    FormatListBulleted,
    FormatListNumbered,
    ArrowDropDown,
} from '@material-ui/icons';
import { ButtonGroup } from 'component/general/button/ButtonGroup';
import { useFocused } from 'slate-react';
import { EditToolbarMarkButton } from './EditToolbarMarkButton';
import { EditToolbarLinkButton } from './EditToolbarLinkButton';
import { EditToolbarBlockButton } from './EditToolbarBlockButton';
import { EditToolbarImageButton } from './EditToolbarImageButton';
import { useSpring, animated } from 'react-spring';
import { useCurrentCategoryId } from 'util/path/useCurrentCategoryId';
import { useCategory } from 'util/categories/useCategory';
import { useCategories } from 'util/categories/useCategories';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: {
            position: 'sticky',
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(1),
            zIndex: 100,
        },
        toolbarButtonGroup: {
            marginRight: theme.spacing(0.5),
        },
    })
);

export interface EditToolbarProps {
    onRequestSave?(): void;
}

const AnimatedToolbar = animated(Toolbar);

export const EditToolbar = React.memo<EditToolbarProps>(({ onRequestSave }) => {
    const currentCategoryId = useCurrentCategoryId();
    const [allCategories] = useCategories();
    const currentCategory = useCategory(currentCategoryId ?? undefined);
    const isFocused = useFocused();

    const props = useSpring({
        maxHeight: isFocused ? 64 : 0,
        opacity: isFocused ? 1 : 0,
        tension: 2000,
        mass: 0.5,
        friction: 15,
        top:
            currentCategory?.category ||
            allCategories.filter((c) => c.category?.id === currentCategoryId)
                .length
                ? 104
                : 64,
    });
    const styles = useStyles();

    return (
        <AnimatedToolbar style={props} className={styles.toolbar}>
            <ButtonGroup className={styles.toolbarButtonGroup}>
                <EditToolbarMarkButton mark={'bold'}>
                    <FormatBold />
                </EditToolbarMarkButton>
                <EditToolbarMarkButton mark={'italic'}>
                    <FormatItalic />
                </EditToolbarMarkButton>
                <EditToolbarMarkButton mark={'underline'}>
                    <FormatUnderlined />
                </EditToolbarMarkButton>
            </ButtonGroup>
            &nbsp;
            <ButtonGroup className={styles.toolbarButtonGroup}>
                <EditToolbarLinkButton />
            </ButtonGroup>
            &nbsp;
            <ButtonGroup className={styles.toolbarButtonGroup}>
                <EditToolbarBlockButton mark={'unordered-list'}>
                    <FormatListBulleted />
                </EditToolbarBlockButton>
                <EditToolbarBlockButton mark={'ordered-list'}>
                    <FormatListNumbered />
                </EditToolbarBlockButton>
            </ButtonGroup>
            &nbsp;
            <ButtonGroup className={styles.toolbarButtonGroup}>
                <EditToolbarImageButton onImageAdded={onRequestSave} />
            </ButtonGroup>
            &nbsp;
            <ButtonGroup className={styles.toolbarButtonGroup}>
                <EditToolbarMarkButton mark={'small'}>
                    <ArrowDropDown />
                </EditToolbarMarkButton>
            </ButtonGroup>
            &nbsp;
        </AnimatedToolbar>
    );
});
