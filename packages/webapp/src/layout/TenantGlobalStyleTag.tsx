import { TenantModel } from 'model';
import { File } from 'util/model';
import { getBaseUrl } from 'helper';

export type TenantGlobalStyleTagProps = {
  tenant: TenantModel;
};

const getImageUrls = (backgroundImageUrl?: string | null) => {
  if (!backgroundImageUrl) {
    return [null, null];
  }

  const baseImageUrl = new URL(backgroundImageUrl);
  baseImageUrl.protocol = 'https:';
  baseImageUrl.searchParams.append('format', 'webp');
  baseImageUrl.searchParams.append('fn', 'cover');
  const imageUrlSimple = new URL(baseImageUrl);
  imageUrlSimple.searchParams.append('width', '1250');
  const imageUrlRetina = new URL(baseImageUrl);
  imageUrlRetina.searchParams.append('width', '2500');

  return [imageUrlSimple, imageUrlRetina];
};

export const TenantGlobalStyleTag = async ({
  tenant,
}: TenantGlobalStyleTagProps) => {
  const baseUrl = await getBaseUrl();
  const backgroundImageUrl =
    tenant.configuration.backgroundImageFile &&
    File.getFileRemoteLocation(
      baseUrl,
      tenant.configuration.backgroundImageFile
    );

  const [imageUrlSimple, imageUrlRetina] = getImageUrls(backgroundImageUrl);
  if (!tenant.configuration.backgroundImageFile) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
@media screen and (min-width: 600px) {
  body::after {
    background-image: url(${imageUrlSimple?.toString()});
    background-image:
      image-set(
        url(${imageUrlSimple?.toString()}) 1x,
        url(${imageUrlRetina?.toString()}) 2x
      );
  }
}
`,
      }}
    />
  );
};
