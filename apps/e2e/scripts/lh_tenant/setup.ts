import * as process from 'node:process';
import { createTenantSetup } from '../../helper';

const setupLighthouseTenant = async () => {
  const admin = {
    name: 'Bilbo Baggins',
    email: 'bilbo.baggins@shire.me',
    password: 'prec10us',
  };

  console.log(`create tenant and assign admin user ${admin.name}`);
  const { tenant } = await createTenantSetup(
    { admin },
    {
      name: `Lighthouse Test`,
      slug: `lighthouse`,
    }
  );

  return tenant;
};

setupLighthouseTenant()
  .then((tenant) => {
    console.log(JSON.stringify(tenant));
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
