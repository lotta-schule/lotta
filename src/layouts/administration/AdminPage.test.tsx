import { adminGroup, SomeUser } from 'test/fixtures';
import { render } from 'test/util';
import { AdminPage } from './AdminPage';

const adminUser = { ...SomeUser, groups: [adminGroup] };

describe('component/layouts/adminLayout/AdminPage', () => {
    it('should show the content when admin', () => {
        const screen = render(
            <AdminPage title={'Start'} component={() => <span>Secret</span>} />,
            {},
            { currentUser: adminUser }
        );

        expect(screen.getByText('Secret')).toBeVisible();
    });

    it('should show an error message when user is not logged in', () => {
        const screen = render(
            <AdminPage title={'Start'} component={() => <span>Secret</span>} />,
            {},
            {}
        );

        expect(screen.queryByText('Secret')).toBeNull();
        expect(screen.getByText(/nicht die notwendigen rechte/i)).toBeVisible();
    });

    it('should show an error message when user is not admin', () => {
        const screen = render(
            <AdminPage title={'Start'} component={() => <span>Secret</span>} />,
            {},
            { currentUser: SomeUser }
        );

        expect(screen.queryByText('Secret')).toBeNull();
        expect(screen.getByText(/nicht die notwendigen rechte/i)).toBeVisible();
    });
});
