import React, { FunctionComponent, memo, useState, useRef, MutableRefObject, MouseEvent, useCallback } from 'react';
import { ContentModuleModel, FileModel } from '../../../../model';
import { Editor, EventHook } from 'slate-react';
import { Value, CommandFunc } from 'slate';
import { renderBlock, renderMark, plugins, renderInline } from './SlateUtils';
import { Toolbar, Collapse } from '@material-ui/core';
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';
import { FormatBold, FormatItalic, FormatUnderlined, FormatListBulleted, FormatListNumbered, Image, Link } from '@material-ui/icons';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { SelectFileButton } from 'component/edit/SelectFileButton';
const { serialize, deserialize } = require('slate-base64-serializer').default;

interface EditProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: {
            padding: 0
        },
        button: {
            marginRight: theme.spacing(1),
        }
    }),
);

export const Edit: FunctionComponent<EditProps> = memo(({ contentModule, onUpdateModule }) => {

    const [editorState, setEditorState] = useState<Value>(contentModule.text ? deserialize(contentModule.text) : Value.create());
    const [isCurrentlyEditing, setCurrentlyEditing] = useState(false);

    const styles = useStyles();

    const editorRef = useRef<Editor>() as MutableRefObject<Editor>;

    const onClickMark = useCallback((e: MouseEvent<HTMLElement>, type: string) => {
        e.preventDefault();
        editorRef.current.toggleMark(type);
        editorRef.current.focus();
    }, [editorRef]);

    const onClickBlock = useCallback((e: MouseEvent<HTMLElement>, type: string) => {
        e.preventDefault();
        const { value } = editorRef.current;
        const { document } = editorState;

        // Handle the extra wrapping required for list buttons.
        const isList = value.blocks.some(node => Boolean(node && node.type === 'list-item'));
        const isExactType = value.blocks.some(block => {
            return !!document.getClosest(block!.key, parent => Boolean(parent && (parent as any).type === block));
        });

        if (!isList) {
            (editorRef.current as any).wrapList({ type });
        } else if (isExactType) {
            (editorRef.current as any)
                .unwrapList()
                .wrapList({ type });
        } else {
            (editorRef.current as any).unwrapList();
        }
        editorRef.current.focus();
    }, [editorRef, editorState]);

    const insertImage: CommandFunc = useCallback((editor, src, target) => {
        if (target) {
            editor.select(target)
        }

        editor.insertBlock({
            type: 'image',
            data: { src },
        });

        return editor;
    }, []);

    const wrapLink = useCallback<CommandFunc>((editor, href: string) => {
        editor.wrapInline({
            type: 'link',
            data: { href },
        });
        editor.moveToEnd();
        return editor;
    }, []);

    const onClickImage = useCallback((file: FileModel) => {
        editorRef.current.focus();
        const src = file.remoteLocation;
        editorRef.current.command(insertImage, src);
    }, [editorRef, insertImage]);

    const onClickLink = useCallback((e: MouseEvent) => {
        e.preventDefault();
        if (!editorRef.current) {
            return;
        }

        if (editorRef.current.value.inlines.some(inline => Boolean(inline && inline.type === 'link'))) {
            editorRef.current.command((editor) => editor.unwrapInline('link'));
        } else if (editorRef.current.value.selection.isExpanded) {
            const href = window.prompt('Ziel-URL des Links eingeben:', 'https://lotta.schule');
            if (!href) {
                return;
            }
            editorRef.current.command(wrapLink, href)
        } else {
            const href = window.prompt('Ziel-URL des Links eingeben:', 'https://lotta.schule');
            if (!href) {
                return;
            }
            const text = window.prompt('Beschreibung des Links:') || href;
            editorRef
                .current
                .insertText(text)
                .moveFocusBackward(text.length)
                .command(wrapLink, href)
        }
        editorRef.current.focus();
    }, [editorRef, wrapLink]);

    const onKeyDownRef = useRef<EventHook>((event, editor, next) => {
        if (!(event as KeyboardEvent).metaKey) {
            if (next) {
                return next();
            }
        }

        switch ((event as KeyboardEvent).key) {
            case 'b': {
                event.preventDefault();
                editor.toggleMark('bold');
                break;
            }
            case 'i': {
                event.preventDefault();
                editor.toggleMark('italic');
                break;
            }
            case 'u': {
                event.preventDefault();
                editor.toggleMark('underline');
                break;
            }
            // Otherwise, let other plugins handle it.
            default: {
                return next();
            }
        }
    });

    const activeMarks = editorState.activeMarks.flatMap(mark => mark ? [mark.type] : []);

    return (
        <>
            <Collapse in={isCurrentlyEditing}>
                <Toolbar className={styles.toolbar}>
                    <ToggleButtonGroup size={'small'} value={activeMarks.toArray()}>
                        <ToggleButton value={'bold'} onClick={e => onClickMark(e, 'bold')}>
                            <FormatBold />
                        </ToggleButton>
                        <ToggleButton value={'italic'} onClick={e => onClickMark(e, 'italic')}>
                            <FormatItalic />
                        </ToggleButton>
                        <ToggleButton value={'underline'} onClick={e => onClickMark(e, 'underline')}>
                            <FormatUnderlined />
                        </ToggleButton>
                        {/* <ToggleButton disabled value="color">
                            <FormatColorFillIcon />
                            <ArrowDropDownIcon />
                        </ToggleButton> */}
                    </ToggleButtonGroup>
                    &nbsp;
                    <ToggleButtonGroup size={'small'} value={null}>
                        <ToggleButton
                            selected={editorRef.current && editorRef.current.value.inlines.some(inline => Boolean(inline && inline.type === 'link'))}
                            onClick={e => onClickLink(e)}
                        >
                            <Link />
                        </ToggleButton>
                    </ToggleButtonGroup>
                    &nbsp;
                    <ToggleButtonGroup size={'small'} value={null}>
                        <ToggleButton
                            selected={editorRef.current && editorRef.current.value.blocks.some(block => Boolean(block && editorRef.current.value.document.getClosest(block.key, parent => Boolean(parent && (parent as any).type === 'unordered-list'))))}
                            onClick={e => onClickBlock(e, 'unordered-list')}
                        >
                            <FormatListBulleted />
                        </ToggleButton>
                        <ToggleButton
                            selected={editorRef.current && editorRef.current.value.blocks.some(block => Boolean(block && editorRef.current.value.document.getClosest(block.key, parent => Boolean(parent && (parent as any).type === 'ordered-list'))))}
                            onClick={e => onClickBlock(e, 'ordered-list')}
                        >
                            <FormatListNumbered />
                        </ToggleButton>
                    </ToggleButtonGroup>
                    &nbsp;
                    <ToggleButtonGroup size={'small'} value={null}>
                        <SelectFileButton buttonComponent={ToggleButton} buttonComponentProps={{ size: 'small' }} onSelectFile={onClickImage} label={<Image />} />
                    </ToggleButtonGroup>
                </Toolbar>
            </Collapse>
            <Editor
                ref={editorRef}
                value={editorState}
                // plugins={plugins}
                onFocus={(ev, editor, next) => {
                    setTimeout(() => setCurrentlyEditing(true));
                    next();
                }}
                onBlur={(ev, editor, next) => {
                    setTimeout(() => {
                        setCurrentlyEditing(false);
                        onUpdateModule({
                            ...contentModule,
                            text: serialize(editor.value)
                        });
                    });
                    next();
                }}
                onChange={(ev: { value: Value }) => setEditorState(ev.value)}
                onKeyDown={onKeyDownRef.current}
                renderMark={renderMark}
                renderInline={renderInline}
                renderBlock={renderBlock}
                plugins={plugins}
            />
        </>
    );
});