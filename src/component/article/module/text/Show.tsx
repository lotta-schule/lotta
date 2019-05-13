import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Editor } from 'slate-react';
import { renderMark } from './SlateUtils';
const { deserialize } = require('slate-base64-serializer').default;

interface ShowProps {
    module: ContentModuleModel;
}

export const Show: FunctionComponent<ShowProps> = memo(({ module: contentModule }) => {

    return (
        <Editor
            value={deserialize(contentModule.text)}
            renderMark={renderMark}
            readOnly
        />
    );
});