import { File } from 'util/model';
import * as React from 'react';
import { Tenant } from 'util/tenant';

export type TenantGlobalStyleTagProps = {
  tenant: Tenant;
};

export const TenantGlobalStyleTag = ({ tenant }: TenantGlobalStyleTagProps) => {
  const cssBackgroundImage = React.useCallback(
    (defaultWidth: number, retinaWidth: number) => {
      if (!tenant.backgroundImageFile) {
        return '';
      }

      const urls = [defaultWidth, retinaWidth].map((width) => ({
        url: File.getRemoteUrl(tenant.backgroundImageFile!, 'pagebg', width),
      }));
      return `background-image: image-set(${urls.map(({ url }, i) => `url(${url}) ${i + 1}x`)});`;
    },
    [tenant.backgroundImageFile]
  );
  if (!tenant.backgroundImageFile) {
    return null;
  }
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `@media screen and (min-width: 600px) {
      body::after {
        ${cssBackgroundImage(1024, 1920)}
      }
  }
  @media screen and (min-width: 1280px) {
      body::after {
        ${cssBackgroundImage(1280, 2560)}
      }
  }`,
      }}
    />
  );
};
