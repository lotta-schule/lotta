import { adminGroup, SomeUser } from 'test/fixtures';
import { render } from 'test/util';
import { AdminLayout } from './AdminLayout';

const adminUser = { ...SomeUser, groups: [adminGroup] };

describe('component/layouts/adminLayout/AdminLayout', () => {
    it('should show the content when admin', () => {
        const screen = render(
            <AdminLayout title={'Start'}>Secret</AdminLayout>,
            {},
            { currentUser: adminUser }
        );

        expect(screen.getByText('Secret')).toBeVisible();
    });

    it('should show an error message when user is not logged in', () => {
        const screen = render(
            <AdminLayout title={'Start'}>Secret</AdminLayout>,
            {},
            {}
        );

        expect(screen.queryByText('Secret')).toBeNull();
        expect(screen.getByText(/nicht die notwendigen rechte/i)).toBeVisible();
    });

    it('should show an error message when user is not admin', () => {
        const screen = render(
            <AdminLayout title={'Start'}>Secret</AdminLayout>,
            {},
            { currentUser: SomeUser }
        );

        expect(screen.queryByText('Secret')).toBeNull();
        expect(screen.getByText(/nicht die notwendigen rechte/i)).toBeVisible();
    });
});
