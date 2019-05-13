import React, { FunctionComponent, memo, useState, useRef, MutableRefObject, MouseEvent } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Editor, EventHook } from 'slate-react';
import { Value } from 'slate';
import { renderMark } from './SlateUtils';
import { Toolbar, Button } from '@material-ui/core';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
const { serialize, deserialize } = require('slate-base64-serializer').default;

interface EditProps {
    module: ContentModuleModel;
    onUpdateModule(module: ContentModuleModel): void;
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

export const Edit: FunctionComponent<EditProps> = memo(({ module: contentModule, onUpdateModule }) => {

    const [editorState, setEditorState] = useState(contentModule.text ? deserialize(contentModule.text) : Value.create());
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
            <Editor
                ref={editorRef}
                value={editorState}
                onChange={({ value }) => {
                    setEditorState(value);
                    if (value.document !== editorState.document) {
                        onUpdateModule({
                            ...contentModule,
                            text: serialize(editorState)
                        })
                    }
                }}
                onKeyDown={onKeyDownRef.current}
                renderMark={renderMark}
            />
        </>
    );
});