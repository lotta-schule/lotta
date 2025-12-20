import React from 'react';
import { CategoryModel } from 'model';
import { Category, File } from 'util/model';
import { Tenant } from 'util/model/Tenant';
import Head from 'next/head';
import { loadTenant } from 'loader/loadTenant';

export interface CategoryHeadProps {
  category: CategoryModel;
}

export const CategoryHead = async ({ category }: CategoryHeadProps) => {
  const tenant = await loadTenant();

  const title = category.isHomepage
    ? tenant.title
    : `${category.title} - ${tenant.title}`;

  const description = category.isHomepage
    ? tenant.title
    : `${category.title} bei ${tenant.title}`;

  const logoImageUrl =
    tenant.logoImageFile &&
    File.getRemoteUrl(tenant.logoImageFile, 'logo', 320);
  const bannerImageUrl =
    category.bannerImageFile &&
    File.getRemoteUrl(category.bannerImageFile, 'banner', 900);

  const image = (():
    | [url: string, width: number, height: number | null]
    | null => {
    if (category.isHomepage && logoImageUrl) {
      return [logoImageUrl, 320, null];
    } else if (category.bannerImageFile && bannerImageUrl) {
      return [bannerImageUrl, 900, 150];
    }
    return null;
  })();

  return (
    <Head>
      <title>{title}</title>
      <meta name={'description'} content={description} />
      <meta property={'og:site_name'} content={tenant.title} />
      <meta property={'og:type'} content={'website'} />
      <meta
        property={'og:url'}
        content={Tenant.getAbsoluteUrl(
          tenant,
          category.isHomepage ? '/' : Category.getPath(category)
        )}
      />
      <meta property={'og:title'} content={title} />
      <meta property={'og:description'} content={description} />
      <meta property={'twitter:card'} content={description} />
      {image && (
        <>
          <meta property={'og:image'} content={image[0]} />
          <meta property={'og:image:width'} content={String(image[1])} />
          {image[2] && (
            <meta property={'og:image:height'} content={String(image[2])} />
          )}
        </>
      )}
    </Head>
  );
};
CategoryHead.displayName = 'CategoryHead';
