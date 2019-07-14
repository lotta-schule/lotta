defmodule ApiWeb.Schema.Types do
  import Absinthe.Resolution.Helpers, only: [dataloader: 1]
  use Absinthe.Schema.Notation

  import_types Absinthe.Type.Custom
  
  object :authresult do
    field :user, :user
    field :token, :string
  end

  object :user do
    field :id, :id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :name, :string
    field :nickname, :string
    field :email, :string
    field :articles, list_of(:article), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Content)
  end

  object :tenant do
    field :id, :id
    field :title, :string
    field :slug, :string
    field :categories, list_of(:category), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
  end

  object :category do
    field :id, :id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :title, :string
    field :category_id, :id
    field :category, :category, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
    field :articles, list_of(:article), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Content)
  end

  object :article do
    field :id, :id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :title, :string
    field :preview, :string
    field :preview_image_url, :string
    field :page_name, :string
    field :content_modules, list_of(:content_module), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Content)
    field :user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :category, :category, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
  end

  object :content_module do
    field :id, :id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :type, :content_module_type
    field :text, :string
    field :sort_key, :integer
  end

  enum :content_module_type do
    value :text, as: "text"
  end

  object :file do
    field :id, :id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :filename, :string
    field :filesize, :integer
    field :mime_type, :string
    field :path, :string
    field :remote_location, :string
    field :file_type, :file_type
    field :user_id, :id
  end

  enum :file_type do
    value :image, as: "image"
    value :audio, as: "audio"
    value :video, as: "video"
    value :pdf, as: "pdf"
    value :misc, as: "misc"
  end
end