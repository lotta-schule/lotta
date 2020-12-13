defmodule ApiWeb.Schema.System do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :system_queries do
    field :system, :system do
      arg(:slug, :string)
      resolve(&ApiWeb.SystemResolver.get/2)
    end

    field :categories, list_of(:category) do
      resolve(&ApiWeb.CategoryResolver.all/2)
    end

    field :widgets, list_of(:widget) do
      arg(:category_id, :id)

      resolve(&ApiWeb.WidgetResolver.all/2)
    end

    field :usage, list_of(:usage) do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      resolve(&ApiWeb.SystemResolver.usage/2)
    end
  end

  object :system_mutations do
    field :update_system, type: :system do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:system, non_null(:system_input))

      resolve(&ApiWeb.SystemResolver.update/2)
    end

    field :create_category, type: :category do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:category, non_null(:create_category_input))

      resolve(&ApiWeb.CategoryResolver.create/2)
    end

    field :update_category, type: :category do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))
      arg(:category, non_null(:update_category_input))

      resolve(&ApiWeb.CategoryResolver.update/2)
    end

    field :delete_category, type: :category do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))

      resolve(&ApiWeb.CategoryResolver.delete/2)
    end

    field :create_widget, type: :widget do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:title, non_null(:string))
      arg(:type, non_null(:widget_type))

      resolve(&ApiWeb.WidgetResolver.create/2)
    end

    field :update_widget, type: :widget do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))
      arg(:widget, non_null(:widget_input))

      resolve(&ApiWeb.WidgetResolver.update/2)
    end

    field :delete_widget, type: :widget do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))

      resolve(&ApiWeb.WidgetResolver.delete/2)
    end
  end
end
