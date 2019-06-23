import React, { FunctionComponent, memo, useState, useRef, MutableRefObject, MouseEvent } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Editor, EventHook } from 'slate-react';
import { Value } from 'slate';
import { renderMark } from './SlateUtils';
import { Toolbar, Button, Grow } from '@material-ui/core';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
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

    const [editorState, setEditorState] = useState(contentModule.text ? deserialize(contentModule.text) : Value.create());
    const [isCurrentlyEditing, setCurrentlyEditing] = useState(false);

    const styles = useStyles();

    const editorRef = useRef<Editor>() as MutableRefObject<Editor>;

    const clickMarkButtonRef = useRef((mark: string) => (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        editorRef.current.toggleMark(mark);
        editorRef.current.focus();
    });

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

    return (
        <>
            <Grow in={isCurrentlyEditing}>
                <Toolbar className={styles.toolbar}>
                    <Button variant={'outlined'} size={'small'} className={styles.button} onClick={clickMarkButtonRef.current('bold')}>
                        <strong>F</strong>
                    </Button>
                    <Button variant={'outlined'} size={'small'} className={styles.button} onClick={clickMarkButtonRef.current('italic')}>
                        <span style={{ fontStyle: 'italic' }}>I</span>
                    </Button>
                    <Button variant={'outlined'} size={'small'} className={styles.button} onClick={clickMarkButtonRef.current('underline')}>
                        <span style={{ textDecoration: 'underline' }}>U</span>
                    </Button>
                </Toolbar>
            </Grow>
            <Editor
                ref={editorRef}
                value={editorState}
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
            />
        </>
    );
});