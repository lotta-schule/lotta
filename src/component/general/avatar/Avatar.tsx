import React from 'react';
import './avatar.css';

export interface AvatarProps {
  /**
   * The avatar image source
   */
  src: string;
}

/**
 * Primary UI component for user interaction
 */

export const Avatar: React.FC<AvatarProps> = ({
  src,
  ...props
}) => {
  return (
   <div className={'lotta-avatar'} style={{ backgroundImage: `url(${src})` }} />
  );
};
