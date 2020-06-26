defmodule ApiWeb.Schema.Tenants.Widget do
  @moduledoc false

  use Absinthe.Schema.Notation

  enum :widget_type do
    value(:calendar, as: "calendar")
    value(:vplan, as: "vplan")
    value(:schedule, as: "schedule")
    value(:tagcloud, as: "tagcloud")
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

  input_object :widget_input do
    field :title, non_null(:string)
    field :groups, list_of(:select_user_group_input)
    field :icon_image_file, :select_file_input
    field :configuration, :json
  end

  input_object :select_widget_input do
    field :id, :lotta_id
  end

  input_object :tenant_input do
    field :title, :string
    field :custom_theme, :json
    field :logo_image_file, :select_file_input
    field :background_image_file, :select_file_input
  end
end
