import React, { memo, FunctionComponent, MouseEventHandler } from 'react';
import { AddBox } from '@material-ui/icons';

export interface UploadButtonIconProps {
    onClick?: MouseEventHandler<HTMLDivElement>;
}

export const UploadButtonIcon: FunctionComponent<UploadButtonIconProps> = memo(({ onClick }) => (
    <div style={{
        position: 'relative',
        backgroundColor: 'red',
        width: '100%',
        height: '100%'
    }}>
        <input type={'file'} onClick={onClick} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0.5 }} />
        <AddBox />
    </div>
));