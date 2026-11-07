import { Page, expect } from '@playwright/test';

/**
 * On mobile, the user navigation and the widgets live in a drawer that is
 * opened from the navigation bar. Opens it and returns it.
 */
export const openMobileDrawer = async (page: Page) => {
  // (the closed drawer is moved out of view, but counts as visible)
  await page.getByRole('button', { name: 'Nutzermenü öffnen' }).click();
  const drawer = page.getByTestId('BaseLayoutSidebar');
  await expect(drawer).toBeVisible();
  return drawer;
};

/**
 * Clicks an entry of the user navigation: the "Mein Profil" menu on desktop,
 * the buttons in the drawer on mobile.
 */
export const clickUserMenuEntry = async (
  page: Page,
  isMobile: boolean,
  entry: { desktop: string | RegExp; mobile: string | RegExp }
) => {
  if (isMobile) {
    const drawer = await openMobileDrawer(page);
    await drawer
      .getByRole('button', { name: entry.mobile })
      .or(drawer.getByRole('link', { name: entry.mobile }))
      .first()
      .click();
  } else {
    await page.getByRole('button', { name: /mein profil/i }).click();
    await page.getByRole('menuitem', { name: entry.desktop }).click();
  }
};
