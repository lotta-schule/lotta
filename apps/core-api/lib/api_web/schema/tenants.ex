defmodule ApiWeb.Schema.Tenants do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :tenants_queries do
    field :tenants, list_of(:tenant) do
      resolve(&Api.TenantResolver.all/2)
    end

    field :tenant, :tenant do
      arg(:id, :id)
      arg(:slug, :string)
      resolve(&Api.TenantResolver.get/2)
    end

    field :categories, list_of(:category) do
      resolve(&Api.CategoryResolver.all/2)
    end

    field :widgets, list_of(:widget) do
      arg(:category_id, :id)

      resolve(&Api.WidgetResolver.all/2)
    end

    field :usage, list_of(:usage) do
      resolve(&Api.TenantResolver.usage/2)
    end
  end

  object :tenants_mutations do
    field :create_tenant, type: :tenant do
      arg(:title, non_null(:string))
      arg(:slug, non_null(:string))
      arg(:email, :string)
      arg(:name, :string)

      resolve(&Api.TenantResolver.create/2)
    end

    field :update_tenant, type: :tenant do
      arg(:tenant, non_null(:tenant_input))

      resolve(&Api.TenantResolver.update/2)
    end

    field :create_category, type: :category do
      arg(:category, non_null(:create_category_input))

      resolve(&Api.CategoryResolver.create/2)
    end

    field :update_category, type: :category do
      arg(:id, non_null(:id))
      arg(:category, non_null(:update_category_input))

      resolve(&Api.CategoryResolver.update/2)
    end

    field :delete_category, type: :category do
      arg(:id, non_null(:id))

      resolve(&Api.CategoryResolver.delete/2)
    end

    field :create_widget, type: :widget do
      arg(:title, non_null(:string))
      arg(:type, non_null(:widget_type))

      resolve(&Api.WidgetResolver.create/2)
    end

    field :update_widget, type: :widget do
      arg(:id, non_null(:id))
      arg(:widget, non_null(:widget_input))

      resolve(&Api.WidgetResolver.update/2)
    end

    field :delete_widget, type: :widget do
      arg(:id, non_null(:id))

      resolve(&Api.WidgetResolver.delete/2)
    end
  end
end
