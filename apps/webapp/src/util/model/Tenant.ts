import { TenantModel } from '#/model/index.js';

export const Tenant = {
  getMainUrl(tenant: TenantModel) {
    return `https://${tenant.host}`;
  },
  getAbsoluteUrl(tenant: TenantModel, url: string) {
    return [this.getMainUrl(tenant), url.replace(/^\//, '')].join('/');
  },
};
