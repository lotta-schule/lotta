import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSquarePlus,
} from '@fortawesome/free-solid-svg-icons';


export interface UploadButtonIconProps {
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const UploadButtonIcon = React.memo<UploadButtonIconProps>(
    ({ onClick }) => (
        <div
            style={{
                position: 'relative',
                backgroundColor: 'red',
                width: '100%',
                height: '100%',
            }}
        >
            <input
                type={'file'}
                onClick={onClick}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.5,
                }}
            />
            <FontAwesomeIcon icon={faSquarePlus} />
        </div>
    )
);
UploadButtonIcon.displayName = 'UploadButtonIcon';
