defmodule ApiWeb.Schema.Contents.Article do
  @moduledoc false

  use Absinthe.Schema.Notation

  input_object :article_input do
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :title, non_null(:string)
    field :preview, :string
    field :ready_to_publish, :boolean
    field :topic, :string
    field :preview_image_file, :select_file_input
    field :groups, list_of(:select_user_group_input)
    field :category, :select_category_input
    field :content_modules, list_of(:content_module_input)
    field :users, list_of(:select_user_input)
  end

  @desc "Filtering options for the article list"
  input_object :article_filter do
    field :updated_before, :naive_datetime,
      description: "Return only results updated before than a given date"

    field :first, :integer, description: "Limit the number of results to return"
  end

  input_object :content_module_input do
    field :id, :id
    field :type, :content_module_type, default_value: "text"
    field :content, :json
    field :files, list_of(:select_file_input)
    field :sort_key, :integer
    field :configuration, :json
  end

  object :article do
    field :id, :id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :title, :string
    field :preview, :string
    field :topic, :string
    field :ready_to_publish, :boolean
    field :is_pinned_to_top, :boolean

    field :preview_image_file, :file,
      resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)

    field :groups, list_of(:user_group), resolve: &ApiWeb.UserGroupResolver.resolve_model_groups/2

    field :content_modules, list_of(:content_module),
      resolve: Absinthe.Resolution.Helpers.dataloader(Api.Content)

    field :users, list_of(:user), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :category, :category, resolve: Absinthe.Resolution.Helpers.dataloader(Api.System)
  end

  object :content_module do
    field :id, :id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :type, :content_module_type
    field :content, :json
    field :files, list_of(:file), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :sort_key, :integer
    field :configuration, :json
  end

  object :content_module_result do
    field :id, :id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :result, :json
    field :user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
  end

  enum :content_module_type do
    value(:title, as: "title")
    value(:text, as: "text")
    value(:image, as: "image")
    value(:image_collection, as: "image_collection")
    value(:video, as: "video")
    value(:audio, as: "audio")
    value(:download, as: "download")
    value(:form, as: "form")
    value(:table, as: "table")
  end
end
