import { loadCurrentUser } from '#/loader/loadCurrentUser';
import { ProfilePage } from '#/profile/ProfilePage';
import { unauthorized } from 'next/navigation.js';

export default async function ProfileRoute() {
  const user = await loadCurrentUser();

  if (!user) {
    unauthorized();
  }

  return <ProfilePage user={user} />;
}
