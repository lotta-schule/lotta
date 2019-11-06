defmodule ApiWeb.Schema.TenantsTypes do
  use Absinthe.Schema.Notation

  object :tenants_queries do
    field :tenants, list_of(:tenant) do
      resolve &Api.TenantResolver.all/2
    end

    field :tenant, :tenant do
      resolve &Api.TenantResolver.current/2
    end
    
    field :categories, list_of(:category) do
      resolve &Api.CategoryResolver.all/2
    end

    field :widgets, list_of(:widget) do
      resolve &Api.WidgetResolver.all/2
    end
  end

  object :tenants_mutations do
    field :update_tenant, type: :tenant do
      arg :tenant, non_null(:tenant_input)
  
      resolve &Api.TenantResolver.update/2
    end

    field :update_category, type: :category do
      arg :id, non_null(:lotta_id)
      arg :category, non_null(:category_input)
  
      resolve &Api.CategoryResolver.update/2
    end
    
    field :create_widget, type: :widget do
      arg :title, non_null(:string)
      arg :type, non_null(:widget_type)
  
      resolve &Api.WidgetResolver.create/2
    end

    field :update_widget, type: :widget do
      arg :id, non_null(:lotta_id)
      arg :widget, non_null(:widget_input)
  
      resolve &Api.WidgetResolver.update/2
    end
  end

  input_object :tenant_input do
    field :title, non_null(:string)
    field :logo_image_file, :file
  end

  input_object :category_input do
    field :title, non_null(:string)
    field :sort_key, :integer
    field :banner_image_file, :file
    field :redirect, :string
    field :hide_articles_from_homepage, :boolean
    field :group, :user_group
    field :widgets, list_of(:widget), default_value: []
  end

  input_object :widget_input do
    field :title, non_null(:string)
    field :group, :user_group
    field :icon_image_file, :file
    field :configuration, :json
  end
end