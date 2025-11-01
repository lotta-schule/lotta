defmodule LottaWeb.Schema.Tenants do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :tenants_queries do
    field(:tenant, :tenant) do
      arg(:slug, :string)
      resolve(&LottaWeb.TenantResolver.get/2)
    end

    field(:categories, non_null(list_of(non_null(:category)))) do
      resolve(&LottaWeb.CategoryResolver.all/2)
    end

    field(:widgets, non_null(list_of(non_null(:widget)))) do
      arg(:category_id, :id)

      resolve(&LottaWeb.WidgetResolver.all/2)
    end

    field(:feedbacks, type: non_null(list_of(non_null(:feedback)))) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      resolve(&LottaWeb.FeedbackResolver.list/2)
    end

    field(:usage, non_null(list_of(non_null(:monthly_usage_period)))) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      resolve(&LottaWeb.TenantResolver.usage/2)
    end

    field(:realtime_analytics, non_null(:integer)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      resolve(&LottaWeb.AnalyticsResolver.realtime/2)
    end

    field(:aggregate_analytics, non_null(:analytics_metrics)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:date, non_null(:date))
      arg(:period, non_null(:analytics_period))

      resolve(&LottaWeb.AnalyticsResolver.aggregate/2)
    end

    field(:timeseries_analytics, non_null(list_of(non_null(:timeseries_metrics)))) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:date, non_null(:date))
      arg(:metric, non_null(:analytics_metric))
      arg(:period, non_null(:analytics_period))

      resolve(&LottaWeb.AnalyticsResolver.timeseries/2)
    end

    field(:breakdown_analytics, non_null(list_of(non_null(:breakdown_metrics)))) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:period, non_null(:analytics_period))
      arg(:date, non_null(:date))
      arg(:property, non_null(:analytics_property))
      arg(:metrics, non_null(list_of(non_null(:analytics_metric))))

      resolve(&LottaWeb.AnalyticsResolver.breakdown/2)
    end
  end

  object :tenants_mutations do
    field(:update_tenant, type: non_null(:tenant)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:tenant, non_null(:tenant_input))

      resolve(&LottaWeb.TenantResolver.update/2)
    end

    field(:create_category, type: non_null(:category)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:category, non_null(:create_category_input))

      resolve(&LottaWeb.CategoryResolver.create/2)
    end

    field(:update_category, type: non_null(:category)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))
      arg(:category, non_null(:update_category_input))

      resolve(&LottaWeb.CategoryResolver.update/2)
    end

    field(:delete_category, type: non_null(:category)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))

      resolve(&LottaWeb.CategoryResolver.delete/2)
    end

    field(:create_widget, type: non_null(:widget)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:title, non_null(:string))
      arg(:type, non_null(:widget_type))

      resolve(&LottaWeb.WidgetResolver.create/2)
    end

    field(:update_widget, type: non_null(:widget)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))
      arg(:widget, non_null(:widget_input))

      resolve(&LottaWeb.WidgetResolver.update/2)
    end

    field(:delete_widget, type: non_null(:widget)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))

      resolve(&LottaWeb.WidgetResolver.delete/2)
    end

    field(:create_feedback, type: non_null(:feedback)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:feedback, non_null(:create_feedback_input))

      resolve(&LottaWeb.FeedbackResolver.create/2)
    end

    field(:send_feedback_to_lotta, type: non_null(:feedback)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))
      arg(:message, :string)

      resolve(&LottaWeb.FeedbackResolver.send_to_lotta/2)
    end

    field(:create_lotta_feedback, type: non_null(:boolean)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:subject, :string)
      arg(:message, non_null(:string))

      resolve(&LottaWeb.FeedbackResolver.create_for_lotta/2)
    end

    field(:respond_to_feedback, type: non_null(:feedback)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))
      arg(:subject, :string)
      arg(:message, non_null(:string))

      resolve(&LottaWeb.FeedbackResolver.respond/2)
    end

    field(:delete_feedback, type: non_null(:feedback)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))

      resolve(&LottaWeb.FeedbackResolver.delete/2)
    end
  end
end
