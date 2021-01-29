import * as React from 'react';
import { render } from 'test/util';
import { UserManagement } from './UserManagement';

describe('component/layouts/adminLayout/userManagement/UserManagement', () => {

    it('should render without error', () => {
        render(
            <UserManagement />
        );
    });
});
