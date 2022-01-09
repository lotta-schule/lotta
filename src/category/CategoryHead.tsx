import * as React from 'react';
import { Category, File } from 'util/model';
import { CategoryModel } from 'model';
import { useTenant } from 'util/tenant/useTenant';
import { useServerData } from 'shared/ServerDataContext';
import { Tenant } from 'util/model/Tenant';
import Head from 'next/head';
import getConfig from 'next/config';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

export interface CategoryHeadProps {
    category: CategoryModel;
}

export const CategoryHead = React.memo<CategoryHeadProps>(({ category }) => {
    const { baseUrl } = useServerData();
    const tenant = useTenant();

    const title = category.isHomepage
        ? tenant.title
        : `${category.title} - ${tenant.title}`;

    const description = category.isHomepage
        ? tenant.title
        : `${category.title} bei ${tenant.title}`;

    const image = React.useMemo<
        [url: string, width: number, height: number] | null
    >(() => {
        if (category.isHomepage && tenant.configuration.logoImageFile) {
            return [
                `https://${cloudimageToken}.cloudimg.io/height/320x240/foil1/${File.getFileRemoteLocation(
                    baseUrl,
                    tenant.configuration.logoImageFile
                )}`,
                320,
                240,
            ];
        } else if (category.bannerImageFile) {
            return [
                `https://${cloudimageToken}.cloudimg.io/cover/950x120/foil1/${File.getFileRemoteLocation(
                    baseUrl,
                    category.bannerImageFile
                )}`,
                950,
                120,
            ];
        }
        return null;
    }, [baseUrl, category, tenant]);

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
                    <meta
                        property={'og:image:width'}
                        content={String(image[1])}
                    />
                    <meta
                        property={'og:image:height'}
                        content={String(image[2])}
                    />
                </>
            )}
        </Head>
    );
});
CategoryHead.displayName = 'CategoryHead';
