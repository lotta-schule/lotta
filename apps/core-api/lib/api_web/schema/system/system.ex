defmodule ApiWeb.Schema.System.System do
  @moduledoc false

  use Absinthe.Schema.Notation

  alias ApiWeb.{UserGroupResolver, SystemResolver}

  object :system do
    field :id, :id
    field :title, :string
    field :slug, :string
    field :custom_theme, :json
    field :inserted_at, :datetime
    field :host, :string, resolve: &SystemResolver.host/2
    field :logo_image_file, :file
    field :background_image_file, :file
    field :user_max_storage_config, :integer

    field :groups, list_of(:user_group), resolve: &UserGroupResolver.all/2

    field :custom_domains, list_of(:custom_domain), resolve: &SystemResolver.custom_domains/2
  end

  object :custom_domain do
    field :id, :id
    field :host, :string
    field :is_main_domain, :boolean
    field :inserted_at, :datetime
    field :updated_at, :datetime
  end

  input_object :system_input do
    field :title, :string
    field :custom_theme, :json
    field :logo_image_file, :select_file_input
    field :background_image_file, :select_file_input
    field :user_max_storage_config, :integer
  end
end
