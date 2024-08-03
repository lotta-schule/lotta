defmodule LottaWeb.Schema.Accounts.File do
  @moduledoc false

  use Absinthe.Schema.Notation

  input_object :create_file_input do
    field :filename, :string
    field :parent_directory_id, :id
  end

  input_object :select_file_input do
    field :id, :id
  end

  input_object :update_file_input do
    field :filename, :string
    field :parent_directory_id, :id
  end

  object :directory do
    field :id, :id
    field :name, :string
    field :inserted_at, :datetime
    field :updated_at, :datetime
    field :user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Accounts)

    field :parent_directory, :directory,
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Storage)

    field :path, list_of(:directory), resolve: &LottaWeb.FileResolver.resolve_path/3
  end

  object :file do
    field :id, :id
    field :inserted_at, :datetime
    field :updated_at, :datetime
    field :filename, :string
    field :filesize, :integer
    field :mime_type, :string
    field :remote_location, :string, resolve: &LottaWeb.FileResolver.resolve_remote_location/3
    field :file_type, :file_type
    field :user_id, :id
    field :user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Accounts)

    field :file_conversions, list_of(:file_conversion),
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Storage)

    field :parent_directory, :directory,
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Storage)

    field :path, list_of(:directory), resolve: &LottaWeb.FileResolver.resolve_path/3

    field :usage, list_of(:file_usage_location),
      resolve: &LottaWeb.FileResolver.resolve_file_usage/3
  end

  object :file_conversion do
    field :id, :id
    field :inserted_at, :datetime
    field :updated_at, :datetime
    field :format, :string
    field :mime_type, :string
    field :remote_location, :string, resolve: &LottaWeb.FileResolver.resolve_remote_location/3
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
      :file_system_usage_location
    ])

    resolve_type(fn map, _ ->
      case map do
        %{category: _} -> :file_category_usage_location
        %{article: _} -> :file_article_usage_location
        %{content_module: _} -> :file_content_module_usage_location
        %{user: _} -> :file_user_usage_location
        _ -> :file_system_usage_location
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

  object :file_system_usage_location do
    field :usage, :string
  end
end
