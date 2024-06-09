export type TenantUsageModel = {
  periodStart: string;
  periodEnd: string;
  storage: {
    usedTotal: number;
    filesTotal: number;
  };
  media: {
    mediaFilesTotal: number;
    mediaFilesTotalDuration: number;
    mediaConversionCurrentPeriod: number | null;
  };
};
