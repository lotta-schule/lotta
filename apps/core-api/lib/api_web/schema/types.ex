defmodule ApiWeb.Schema.Types do
  import Absinthe.Resolution.Helpers, only: [dataloader: 1]
  use Absinthe.Schema.Notation

  import_types ApiWeb.Schema.Types.JSON
  import_types ApiWeb.Schema.Types.LottaId
  import_types Absinthe.Type.Custom
  
  object :authresult do
    field :user, :user
    field :token, :string
  end

  object :user do
    field :id, :lotta_id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :name, :string
    field :class, :string
    field :nickname, :string
    field :email, :string
    field :avatar_image_file, :file, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :articles, list_of(:article), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Content)
    field :groups, list_of(:user_group), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
  end

  object :user_group do
    field :id, :lotta_id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :name, :string
    field :priority, :integer
    field :is_admin_group, :boolean
    field :tenant, :tenant, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
  end

  object :tenant do
    field :id, :lotta_id
    field :title, :string
    field :slug, :string
    field :categories, list_of(:category), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
    field :groups, list_of(:user_group), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
  end

  object :category do
    field :id, :lotta_id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :title, :string
    field :is_sidenav, :boolean
    field :is_homepage, :boolean
    field :redirect, :string
    field :hide_articles_from_homepage, :boolean
    field :sort_key, :integer
    field :banner_image_file, :file, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :category, :category, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
    field :group, :user_group, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :articles, list_of(:article), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Content)
    field :widgets, list_of(:widget), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
  end

  object :widget do
    field :id, :lotta_id
    field :title, :string
    field :type, :widget_type
    field :configuration, :json
    field :icon_image_file, :file, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :group, :user_group, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :tenant, :tenant, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
  end

  enum :widget_type do
    value :calendar, as: "calendar"
    value :vplan, as: "vplan"
    value :tagcloud, as: "tagcloud"
  end

  object :article do
    field :id, :lotta_id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :title, :string
    field :preview, :string
    field :topic, :string
    field :ready_to_publish, :boolean
    field :is_pinned_to_top, :boolean
    field :preview_image_file, :file, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :group, :user_group, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :content_modules, list_of(:content_module), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Content)
    field :users, list_of(:user), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :category, :category, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
  end

  object :content_module do
    field :id, :lotta_id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :type, :content_module_type
    field :text, :string
    field :files, list_of(:file), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :sort_key, :integer
    field :configuration, :json
  end

  enum :content_module_type do
    value :title, as: "title"
    value :text, as: "text"
    value :image, as: "image"
    value :video, as: "video"
    value :audio, as: "audio"
    value :download, as: "download"
  end

  object :file do
    field :id, :lotta_id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :filename, :string
    field :filesize, :integer
    field :mime_type, :string
    field :path, :string
    field :remote_location, :string
    field :file_type, :file_type
    field :user_id, :lotta_id
    field :file_conversions, list_of(:file_conversion), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
  end

  object :file_conversion do
    field :id, :lotta_id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :format, :string
    field :mime_type, :string
    field :remote_location, :string
  end

  object :calendar_event do
    field :uid, :string
    field :description, :string
    field :summary, :string
    field :start, :naive_datetime
    field :end, :naive_datetime
  end

  enum :file_type do
    value :image, as: "image"
    value :audio, as: "audio"
    value :video, as: "video"
    value :pdf, as: "pdf"
    value :misc, as: "misc"
  end
end