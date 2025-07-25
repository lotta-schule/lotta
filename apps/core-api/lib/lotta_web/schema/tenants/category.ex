defmodule LottaWeb.Schema.Tenants.Category do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :category do
    field(:id, :id)
    field(:inserted_at, :datetime)
    field(:updated_at, :datetime)
    field(:title, :string)
    field(:is_sidenav, :boolean)
    field(:is_homepage, :boolean)
    field(:layout_name, :string)
    field(:redirect, :string)
    field(:hide_articles_from_homepage, :boolean)
    field(:sort_key, :integer)

    field(:banner_image_file, :file,
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Storage)
    )

    field(:category, :category, resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Tenants))

    field(:groups, list_of(:user_group),
      resolve: &LottaWeb.UserGroupResolver.resolve_model_groups/3
    )

    field(:widgets, list_of(:widget), resolve: &LottaWeb.CategoryResolver.resolve_widgets/2)
  end

  input_object :create_category_input do
    field(:title, non_null(:string))
    field(:is_sidenav, :boolean, default_value: false)
    field(:category, :select_category_input)
  end

  input_object :update_category_input do
    field(:title, :string)
    field(:is_sidenav, :boolean)
    field(:sort_key, :integer)
    field(:banner_image_file, :select_file_input)
    field(:category, :select_category_input)
    field(:redirect, :string)
    field(:layout_name, :string)
    field(:hide_articles_from_homepage, :boolean)
    field(:groups, list_of(:select_user_group_input))
    field(:widgets, list_of(:select_widget_input), default_value: [])
  end

  input_object :select_category_input do
    field(:id, :id)
  end
end
