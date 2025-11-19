import { chromium } from 'playwright';
import { createTenantSetup } from '../../helper';
import { Browser } from '@playwright/test';

(async () => {
  const admin = {
    name: 'Bilbo Baggins',
    email: 'bilbo.baggins@shire.me',
    password: 'prec10us',
  };

  console.log(`create tenant and assign admin user ${admin.name}`);
  const browser = await chromium.launch();

  const { tenant } = await createTenantSetup(
    { browser: browser as Browser, admin },
    {
      name: `Lighthouse Test`,
      slug: `lighthouse`,
    }
  );

  console.log(tenant);
})();
