export type MetricType =
  | 'visits'
  | 'visitors'
  | 'pageviews'
  | 'bounceRate'
  | 'visitDuration'
  | 'viewsPerVisit';

export type PropertyName =
  `VISIT_${'DEVICE' | 'BROWSER' | 'OS' | 'SOURCE' | 'ENTRY_PAGE' | 'EXIT_PAGE'}`;

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

export type GQLCompatibleMetricType<T extends MetricType = MetricType> =
  Uppercase<CamelToSnakeCase<T>>;

export const gqlCompatibleMetricType = <T extends MetricType>(metric: T) =>
  metric.replace(/([A-Z])/g, '_$1').toUpperCase() as GQLCompatibleMetricType<T>;
