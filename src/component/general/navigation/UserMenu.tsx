import { AccountCircle, AddCircle, Forum, SearchRounded } from '@material-ui/icons';
import { UserModel } from 'model';
import React from 'react';
import { Avatar } from '../avatar/Avatar';
import { NavigationButton, } from '../button/NavigationButton';
import './user-menu.scss';

export interface UserMenuProps {
  user?: UserModel;
}

/**
 * Primary UI component for user interaction
 */
export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  return (
    <div className="user-menu">
      {user && (
        <div className="user-menu-avatar">
            <Avatar src={'https://www.flaticon.com/svg/static/icons/svg/3870/3870479.svg'} />
        </div>
      )}
      <div>
        <nav>
          <ul>
            <li>
              <NavigationButton icon={<AddCircle />} label={'neuer Beitrag'}/>
            </li>
            <li>
              <NavigationButton icon={<SearchRounded />} label={'Suche'} />
            </li>
            <li>
              <NavigationButton icon={<Forum />} label={'Nachrichten'} />
            </li>
            <li>
              <NavigationButton icon={<AccountCircle />} label={user?.nickname + 's Profil'} />
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};