defmodule LottaWeb.Schema.Tenants.Tenant do
  @moduledoc false

  use Absinthe.Schema.Notation

  alias LottaWeb.{UserGroupResolver, TenantResolver}

  object :tenant do
    field :id, :id
    field :title, :string
    field :slug, :string
    field :configuration, :tenant_configuration, resolve: &TenantResolver.resolve_configuration/2
    field :inserted_at, :datetime
    field :host, :string, resolve: &TenantResolver.host/2

    field :groups, list_of(:user_group), resolve: &UserGroupResolver.all/2

    field :custom_domains, list_of(:custom_domain), resolve: &TenantResolver.custom_domains/2
  end

  object :custom_domain do
    field :id, :id
    field :host, :string
    field :is_main_domain, :boolean
    field :inserted_at, :datetime
    field :updated_at, :datetime
  end

  object :tenant_configuration do
    field :background_image_file, :file
    field :logo_image_file, :file
    field :custom_theme, :json
    field :user_max_storage_config, :string
  end

  input_object :tenant_input do
    field :title, :string
    field :configuration, :tenant_configuration_input
  end

  input_object :tenant_configuration_input do
    field :background_image_file, :select_file_input
    field :logo_image_file, :select_file_input
    field :custom_theme, :json
    field :user_max_storage_config, :string
  end
end
