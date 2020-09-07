defmodule ApiWeb.Schema.System do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :system_queries do
    field :system, :system do
      arg(:slug, :string)
      resolve(&Api.SystemResolver.get/2)
    end

    field :categories, list_of(:category) do
      resolve(&Api.CategoryResolver.all/2)
    end

    field :widgets, list_of(:widget) do
      arg(:category_id, :id)

      resolve(&Api.WidgetResolver.all/2)
    end

    field :usage, list_of(:usage) do
      resolve(&Api.SystemResolver.usage/2)
    end
  end

  object :system_mutations do
    field :update_system, type: :system do
      arg(:system, non_null(:system_input))

      resolve(&Api.SystemResolver.update/2)
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
