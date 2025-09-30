defmodule LottaWeb.Schema.Tenants.Tenant do
  @moduledoc false

  use Absinthe.Schema.Notation

  alias LottaWeb.TenantResolver

  object :tenant do
    field(:id, non_null(:id))
    field(:title, non_null(:string))
    field(:type, :string)
    field(:state, non_null(:tenant_state))
    field(:slug, non_null(:string))
    field(:address, non_null(:string))
    field(:host, non_null(:string), resolve: &TenantResolver.resolve_host/3)
    field(:configuration, non_null(:tenant_configuration))
    field(:logo_image_file, :file, resolve: &TenantResolver.resolve_logo_image_file/3)
    field(:background_image_file, :file, resolve: &TenantResolver.resolve_background_image_file/3)

    field(:inserted_at, non_null(:datetime))

    field(:identifier, non_null(:string), resolve: &TenantResolver.resolve_identifier/3)

    field(:eduplaces_id, :string)

    field(:stats, :tenant_stats) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      resolve(&TenantResolver.get_stats/2)
    end

    field(:custom_domains, non_null(list_of(non_null(:custom_domain))),
      resolve: &TenantResolver.resolve_custom_domains/3
    )
  end

  object :custom_domain do
    field(:id, :id)
    field(:host, :string)
    field(:is_main_domain, :boolean)
    field(:inserted_at, :datetime)
    field(:updated_at, :datetime)
  end

  object :tenant_configuration do
    field(:background_image_file, :file)
    field(:logo_image_file, :file)
    field(:custom_theme, :json)
    field(:user_max_storage_config, :string)
  end

  object :tenant_stats do
    field(:user_count, :integer)
    field(:article_count, :integer)
    field(:category_count, :integer)
    field(:file_count, :integer)
  end

  input_object :tenant_input do
    field(:title, :string)
    field(:background_image_file_id, :id)
    field(:logo_image_file_id, :id)
    field(:configuration, :tenant_configuration_input)
  end

  input_object :tenant_configuration_input do
    field(:custom_theme, :json)
    field(:user_max_storage_config, :string)
  end

  enum :tenant_state do
    value(:init, description: "Tenant is being initialized")
    value(:active, description: "Tenant is active and operational")
    value(:readonly, description: "Tenant is in read-only mode")
  end
end
