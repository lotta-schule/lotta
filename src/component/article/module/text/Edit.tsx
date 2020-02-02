import React, { KeyboardEvent, memo, useState, useRef, MouseEvent, useCallback, useEffect, useMemo } from 'react';
import { ContentModuleModel, FileModel } from '../../../../model';
import { withReact } from 'slate-react';
import { createEditor, Node } from 'slate';
import { plugins } from './SlateUtils';
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

export const Edit = memo<EditProps>(({ contentModule, onUpdateModule }) => {

    const [editorState, setEditorState] = useState<Node[]>(contentModule.text ? deserialize(contentModule.text) : []);

    const styles = useStyles();

    const editor = useMemo(() => withReact(createEditor()), []);

    const onClickMark = useCallback((e: MouseEvent<HTMLElement>, type: string) => {
        e.preventDefault();
        editor.toggleMark(type);
        editor.focus();
    }, [editor]);

    const onClickBlock = useCallback((e: MouseEvent<HTMLElement>, type: string) => {
        e.preventDefault();
        const { value } = editor;
        const { document } = editorState;

        // Handle the extra wrapping required for list buttons.
        const isList = value.blocks.some(node => Boolean(node && node.type === 'list-item'));
        const isExactType = value.blocks.some(block => {
            return !!document.getClosest(block!.key, parent => Boolean(parent && (parent as any).type === block));
        });

        if (!isList) {
            (editor as any).wrapList({ type });
        } else if (isExactType) {
            (editor as any)
                .unwrapList()
                .wrapList({ type });
        } else {
            (editor as any).unwrapList();
        }
        editor.focus();
    }, [editor, editorState]);

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
        editor.focus();
        const src = file.remoteLocation;
        editor.command(insertImage, src);
    }, [editor, insertImage]);

    const onClickLink = useCallback((e: MouseEvent) => {
        e.preventDefault();
        if (!editor) {
            return;
        }

        if (editor.value.inlines.some(inline => Boolean(inline && inline.type === 'link'))) {
            editor.command((editor) => editor.unwrapInline('link'));
        } else if (editor.value.selection.isExpanded) {
            const href = window.prompt('Ziel-URL des Links eingeben:', 'https://lotta.schule');
            if (!href) {
                return;
            }
            editor.command(wrapLink, href)
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
        editor.focus();
    }, [editor, wrapLink]);

    const onKeyDownRef = useRef<EventHook<KeyboardEvent<Element>>>((event, editor, next) => {
        if (!event.metaKey) {
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

    const isFocused = editor?.value.selection.isFocused;

    useEffect(() => {
        if (isFocused === false) {
            onUpdateModule({
                ...contentModule,
                text: serialize(editor.value)
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused]);

    return (
        <>
            <Slate editor={editor}>
                <Collapse in={isFocused}>
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
                    <ToggleButtonGroup size={'small'} value={'none'}>
                            <ToggleButton
                                value={'link'}
                                selected={editor && editorRef.current.value.inlines.some(inline => Boolean(inline && inline.type === 'link'))}
                                onClick={e => onClickLink(e)}
                            >
                                <Link />
                            </ToggleButton>
                        </ToggleButtonGroup>
                        &nbsp;
                    <ToggleButtonGroup size={'small'} value={'none'}>
                            <ToggleButton
                                value={'unordered-list'}
                                selected={editor && editorRef.current.value.blocks.some(block => Boolean(block && editorRef.current.value.document.getClosest(block.key, parent => Boolean(parent && (parent as any).type === 'unordered-list'))))}
                                onClick={e => onClickBlock(e, 'unordered-list')}
                            >
                                <FormatListBulleted />
                            </ToggleButton>
                            <ToggleButton
                                value={'ordered-list'}
                                selected={editor && editorRef.current.value.blocks.some(block => Boolean(block && editorRef.current.value.document.getClosest(block.key, parent => Boolean(parent && (parent as any).type === 'ordered-list'))))}
                                onClick={e => onClickBlock(e, 'ordered-list')}
                            >
                                <FormatListNumbered />
                            </ToggleButton>
                        </ToggleButtonGroup>
                        &nbsp;
                    <ToggleButtonGroup size={'small'} value={'none'}>
                            <SelectFileButton
                                buttonComponent={ToggleButton}
                                buttonComponentProps={{ size: 'small', value: 'select-file' }}
                                onSelectFile={onClickImage}
                                label={<Image />}
                            />
                        </ToggleButtonGroup>
                    </Toolbar>
                </Collapse>

                <Editable />
            </Slate>
            <Editor
                ref={editorRef}
                value={editorState}
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