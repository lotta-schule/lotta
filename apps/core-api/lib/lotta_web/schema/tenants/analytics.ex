defmodule LottaWeb.Schema.Tenants.Analytics do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :analytics_metrics do
    field(:bounce_rate, non_null(:integer))
    field(:pageviews, non_null(:integer))
    field(:visitors, non_null(:integer))
    field(:visits, non_null(:integer))
    field(:views_per_visit, non_null(:float))
    field(:visit_duration, non_null(:integer))
  end

  enum :analytics_metric do
    value(:bounce_rate)
    value(:pageviews)
    value(:visitors)
    value(:visits)
    value(:views_per_visit)
    value(:visit_duration)
  end

  enum :analytics_property do
    value(:event_goal)
    value(:event_page)
    value(:event_hostname)
    value(:visit_entry_page)
    value(:visit_exit_page)
    value(:visit_source)
    value(:visit_referrer)
    value(:visit_utm_medium)
    value(:visit_utm_source)
    value(:visit_utm_campaign)
    value(:visit_utm_content)
    value(:visit_utm_term)
    value(:visit_device)
    value(:visit_browser)
    value(:visit_browser_version)
    value(:visit_os)
    value(:visit_os_version)
    value(:visit_country)
    value(:visit_region)
    value(:visit_city)
  end

  object :timeseries_metrics do
    field(:date, non_null(:string))
    field(:value, :float)
  end

  object :breakdown_metrics do
    field(:property, non_null(:string))
    field(:metrics, non_null(list_of(non_null(:metric_result))))
  end

  object :metric_result do
    field(:metric, non_null(:analytics_metric))
    field(:value, non_null(:integer))
  end
end
