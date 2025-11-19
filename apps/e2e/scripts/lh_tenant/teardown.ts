import { deleteTenant } from '../../helper';
import { argv } from 'node:process';

(async () => {
  const tenantId = argv.at(-1);
  if (!tenantId) {
    throw new Error('No tenant id given!');
  }
  await deleteTenant(tenantId);
})();
