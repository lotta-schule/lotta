defmodule LottaWeb.Schema.Tenants.Analytics do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :analytics_metrics do
    field :bounce_rate, :integer
    field :pageviews, :integer
    field :visitors, :integer
    field :visits, :integer
    field :views_per_visit, :float
    field :visit_duration, :integer
  end

  enum :analytics_metric do
    value(:bounce_rate)
    value(:pageviews)
    value(:visitors)
    value(:visits)
    value(:views_per_visit)
    value(:visit_duration)
  end

  object :timeseries_metrics do
    field :date, non_null(:string)
    field :value, :float
  end
end
