defmodule ApiWeb.Schema.TenantsTypes do
  use Absinthe.Schema.Notation

  object :tenants_queries do
    field :tenants, list_of(:tenant) do
      resolve &Api.TenantResolver.all/2
    end

    field :tenant, :tenant do
      arg :id, :lotta_id
      arg :slug, :string
      resolve &Api.TenantResolver.get/2
    end

    field :categories, list_of(:category) do
      resolve &Api.CategoryResolver.all/2
    end

    field :widgets, list_of(:widget) do
      resolve &Api.WidgetResolver.all/2
    end
  end

  object :tenants_mutations do
    field :create_tenant, type: :tenant do
      arg :title, non_null(:string)
      arg :slug, non_null(:string)
      arg :email, non_null(:string)
      arg :name, non_null(:string)

      resolve &Api.TenantResolver.create/2
    end

    field :update_tenant, type: :tenant do
      arg :tenant, non_null(:tenant_input)

      resolve &Api.TenantResolver.update/2
    end

    field :create_category, type: :category do
      arg :category, non_null(:category_input)

      resolve &Api.CategoryResolver.create/2
    end

    field :update_category, type: :category do
      arg :id, non_null(:lotta_id)
      arg :category, non_null(:category_input)

      resolve &Api.CategoryResolver.update/2
    end

    field :delete_category, type: :category do
      arg :id, non_null(:lotta_id)

      resolve &Api.CategoryResolver.delete/2
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

    field :delete_widget, type: :widget do
      arg :id, non_null(:lotta_id)

      resolve &Api.WidgetResolver.delete/2
    end
  end

  input_object :tenant_input do
    field :title, :string
    field :custom_theme, :json
    field :logo_image_file, :file
    field :background_image_file, :file
  end

  input_object :category_input do
    field :title, non_null(:string)
    field :is_sidenav, :boolean
    field :sort_key, :integer
    field :banner_image_file, :file
    field :category, :category
    field :redirect, :string
    field :layout_name, :string
    field :hide_articles_from_homepage, :boolean
    field :groups, list_of(:user_group)
    field :widgets, list_of(:widget), default_value: []
  end

  input_object :widget_input do
    field :title, non_null(:string)
    field :groups, list_of(:user_group)
    field :icon_image_file, :file
    field :configuration, :json
  end

  object :tenant do
    field :id, :lotta_id
    field :title, :string
    field :slug, :string
    field :custom_theme, :json
    field :inserted_at, :naive_datetime
    field :logo_image_file, :file, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :background_image_file, :file, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :categories, list_of(:category), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
    field :groups, list_of(:user_group), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :custom_domains, list_of(:custom_domain), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
  end

  object :category do
    field :id, :lotta_id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :title, :string
    field :is_sidenav, :boolean
    field :is_homepage, :boolean
    field :layout_name, :string
    field :redirect, :string
    field :hide_articles_from_homepage, :boolean
    field :sort_key, :integer
    field :banner_image_file, :file, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :category, :category, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
    field :groups, list_of(:user_group), resolve: &Api.UserGroupResolver.resolve_model_groups/2
    field :widgets, list_of(:widget), resolve: &Api.Tenants.resolve_widgets/2
  end

  object :widget do
    field :id, :lotta_id
    field :title, :string
    field :type, :widget_type
    field :configuration, :json
    field :icon_image_file, :file, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :groups, list_of(:user_group), resolve: &Api.UserGroupResolver.resolve_model_groups/2
    field :tenant, :tenant, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
  end

  object :custom_domain do
    field :id, :lotta_id
    field :host, :string
    field :is_main_domain, :boolean
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
  end

  enum :widget_type do
    value :calendar, as: "calendar"
    value :vplan, as: "vplan"
    value :schedule, as: "schedule"
    value :tagcloud, as: "tagcloud"
  end
end
