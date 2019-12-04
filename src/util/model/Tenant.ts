import { ClientModel } from 'model';

export const Tenant = {
    getLottaDomainHost(tenant: ClientModel) {
        return tenant.slug + process.env.REACT_APP_APP_BASE_DOMAIN;
    },
};