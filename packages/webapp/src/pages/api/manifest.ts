import { NextApiHandler, MetadataRoute } from 'next';
import { TenantModel } from 'model';
import { getApolloClient } from 'api/legacyClient';

import GetTenantQuery from 'api/query/GetTenantQuery.graphql';

const handler: NextApiHandler = async (req, res) => {
  const headers = req.headers ?? {};

  const { data, error } = await getApolloClient().query({
    query: GetTenantQuery,
    context: {
      headers,
    },
  });

  const tenant: TenantModel = data?.tenant ?? null;

  if (error || !tenant) {
    res.status(404).json({
      error: 'Tenant not found',
    });
    return;
  }

  const manifest: MetadataRoute.Manifest = {
    name: `${tenant.title} - Lotta`,
    short_name: tenant.title,
    start_url: '/',
    lang: 'de',
    icons: [
      {
        src: 'favicon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'favicon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    theme_color:
      tenant.configuration?.customTheme?.pageBackgroundColor ?? '#ffffff',
    display: 'standalone',
  };

  res.status(200).json(manifest);
};

export default handler;
