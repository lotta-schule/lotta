defmodule ApiWeb.Schema.Accounts.File do
  @moduledoc false

  use Absinthe.Schema.Notation

  input_object :create_file_input do
    field :filename, :string
    field :parent_directory_id, :lotta_id
  end

  input_object :select_file_input do
    field :id, :lotta_id
  end

  input_object :update_file_input do
    field :filename, :string
    field :parent_directory_id, :lotta_id
  end

  object :directory do
    field :id, :lotta_id
    field :name, :string
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :tenant, :tenant, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)

    field :parent_directory, :directory,
      resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
  end

  object :file do
    field :id, :lotta_id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :filename, :string
    field :filesize, :integer
    field :mime_type, :string
    field :remote_location, :string
    field :file_type, :file_type
    field :user_id, :lotta_id
    field :user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)

    field :file_conversions, list_of(:file_conversion),
      resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)

    field :parent_directory, :directory,
      resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)

    field :usage, list_of(:file_usage_location), resolve: &Api.FileResolver.resolve_file_usage/3
  end

  object :file_conversion do
    field :id, :lotta_id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :format, :string
    field :mime_type, :string
    field :remote_location, :string
  end

  enum :file_type do
    value(:image, as: "image")
    value(:audio, as: "audio")
    value(:video, as: "video")
    value(:pdf, as: "pdf")
    value(:misc, as: "misc")
  end

  union :file_usage_location do
    types([
      :file_category_usage_location,
      :file_article_usage_location,
      :file_content_module_usage_location,
      :file_user_usage_location,
      :file_tenant_usage_location
    ])

    resolve_type(fn map, _ ->
      case map do
        %{category: _} -> :file_category_usage_location
        %{article: _} -> :file_article_usage_location
        %{content_module: _} -> :file_content_module_usage_location
        %{tenant: _} -> :file_tenant_usage_location
        %{user: _} -> :file_user_usage_location
      end
    end)
  end

  object :file_category_usage_location do
    field :usage, :string
    field :category, :category
  end

  object :file_article_usage_location do
    field :usage, :string
    field :article, :article
  end

  object :file_content_module_usage_location do
    field :usage, :string
    field :content_module, :content_module
    field :article, :article
  end

  object :file_user_usage_location do
    field :usage, :string
    field :user, :user
  end

  object :file_tenant_usage_location do
    field :usage, :string
    field :tenant, :tenant
  end
end
