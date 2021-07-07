defmodule LottaWeb.Schema.Tenants do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :tenants_queries do
    field :tenant, :tenant do
      arg(:slug, :string)
      resolve(&LottaWeb.TenantResolver.get/2)
    end

    field :categories, list_of(:category) do
      resolve(&LottaWeb.CategoryResolver.all/2)
    end

    field :widgets, list_of(:widget) do
      arg(:category_id, :id)

      resolve(&LottaWeb.WidgetResolver.all/2)
    end

    field :usage, list_of(:usage) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      resolve(&LottaWeb.TenantResolver.usage/2)
    end
  end

  object :tenants_mutations do
    field :update_tenant, type: :tenant do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:tenant, non_null(:tenant_input))

      resolve(&LottaWeb.TenantResolver.update/2)
    end

    field :create_category, type: :category do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:category, non_null(:create_category_input))

      resolve(&LottaWeb.CategoryResolver.create/2)
    end

    field :update_category, type: :category do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))
      arg(:category, non_null(:update_category_input))

      resolve(&LottaWeb.CategoryResolver.update/2)
    end

    field :delete_category, type: :category do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))

      resolve(&LottaWeb.CategoryResolver.delete/2)
    end

    field :create_widget, type: :widget do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:title, non_null(:string))
      arg(:type, non_null(:widget_type))

      resolve(&LottaWeb.WidgetResolver.create/2)
    end

    field :update_widget, type: :widget do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))
      arg(:widget, non_null(:widget_input))

      resolve(&LottaWeb.WidgetResolver.update/2)
    end

    field :delete_widget, type: :widget do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))

      resolve(&LottaWeb.WidgetResolver.delete/2)
    end
  end
end
