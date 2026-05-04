import { tenant } from '#/test/fixtures/index.js';
import { Tenant } from './Tenant.js';

describe('util/model/Tenant', () => {
  it("Should give the tnenat's url", () => {
    expect(Tenant.getMainUrl(tenant)).toEqual('https://info.lotta.schule');
  });
  describe('Should return a correct absolute url', () => {
    it('with leading "/"', () => {
      expect(Tenant.getAbsoluteUrl(tenant, '/test')).toEqual(
        'https://info.lotta.schule/test'
      );
    });
    it('without leading "/"', () => {
      expect(Tenant.getAbsoluteUrl(tenant, 'test')).toEqual(
        'https://info.lotta.schule/test'
      );
    });
  });
});
