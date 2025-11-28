import { NextResponse } from 'next/server';
import { loadTenant } from 'loader';
import type { MetadataRoute } from 'next';

export async function GET() {
  const tenant = await loadTenant().catch(() => null);

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
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
      (tenant.configuration?.customTheme as any)?.pageBackgroundColor ??
      '#ffffff',
    display: 'standalone',
  };

  return NextResponse.json(manifest);
}
