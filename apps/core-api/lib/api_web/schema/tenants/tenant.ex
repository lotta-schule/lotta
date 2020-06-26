defmodule ApiWeb.Schema.Tenants.Category do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :tenant do
    field :id, :lotta_id
    field :title, :string
    field :slug, :string
    field :custom_theme, :json
    field :inserted_at, :naive_datetime
    field :logo_image_file, :file, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)

    field :background_image_file, :file,
      resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)

    field :categories, list_of(:category),
      resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)

    field :groups, list_of(:user_group),
      resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)

    field :custom_domains, list_of(:custom_domain),
      resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
  end

  object :custom_domain do
    field :id, :lotta_id
    field :host, :string
    field :is_main_domain, :boolean
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
  end
end
