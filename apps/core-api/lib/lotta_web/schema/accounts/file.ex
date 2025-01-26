defmodule LottaWeb.Schema.Accounts.File do
  @moduledoc false

  use Absinthe.Schema.Notation

  input_object :create_file_input do
    field(:filename, non_null(:string))
    field(:parent_directory_id, :id)
  end

  input_object :select_file_input do
    field(:id, non_null(:id))
  end

  input_object :update_file_input do
    field(:filename, non_null(:string))
    field(:parent_directory_id, :id)
  end

  object :directory do
    field(:id, non_null(:id))
    field(:name, non_null(:string))
    field(:inserted_at, non_null(:datetime))
    field(:updated_at, non_null(:datetime))
    field(:user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Accounts))

    field(:parent_directory, :directory,
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Storage)
    )

    field(:path, non_null(list_of(non_null(:directory))),
      resolve: &LottaWeb.FileResolver.resolve_path/3
    )
  end

  object :file do
    field(:id, non_null(:id))
    field(:inserted_at, non_null(:datetime))
    field(:updated_at, non_null(:datetime))
    field(:filename, non_null(:string))
    field(:filesize, non_null(:integer))
    field(:mime_type, non_null(:string))

    field(:remote_location, non_null(:string),
      resolve: &LottaWeb.FileResolver.resolve_remote_location/3
    )

    field(:file_type, non_null(:file_type))
    field(:user_id, :id)
    field(:user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Accounts))

    field(:file_conversions, non_null(list_of(non_null(:file_conversion))),
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Storage)
    )

    field(:parent_directory, :directory,
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Storage)
    )

    field(:path, non_null(list_of(non_null(:directory))),
      resolve: &LottaWeb.FileResolver.resolve_path/3
    )

    field(:urls, non_null(list_of(non_null(:url)))) do
      arg(:formats, non_null(list_of(non_null(:conversion_format))))

      resolve(&LottaWeb.FileResolver.resolve_urls/3)
    end
  end

  object :file_conversion do
    field(:id, non_null(:id))
    field(:inserted_at, non_null(:datetime))
    field(:updated_at, non_null(:datetime))
    field(:format, non_null(:string))
    field(:mime_type, non_null(:string))

    field(:remote_location, non_null(:string),
      resolve: &LottaWeb.FileResolver.resolve_remote_location/3
    )
  end

  object :url do
    field(:format, non_null(:conversion_format))
    field(:url, :string)
  end

  enum :conversion_format do
    value(:original, as: "original")
    value(:preview_200, as: "preview_200")
    value(:preview_400, as: "preview_400")
    value(:avatar_50, as: "avatar_50")
    value(:avatar_100, as: "avatar_100")
    value(:avatar_250, as: "avatar_250")
    value(:avatar_500, as: "avatar_500")
    value(:avatar_1000, as: "avatar_1000")
    value(:webm_720p, as: "webm_720p")
    value(:webm_1080p, as: "webm_1080p")
    value(:h264_720p, as: "h264_720p")
    value(:h264_1080p, as: "h264_1080p")
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
    field(:usage, non_null(:string))
    field(:category, non_null(:category))
  end

  object :file_article_usage_location do
    field(:usage, non_null(:string))
    field(:article, non_null(:article))
  end

  object :file_content_module_usage_location do
    field(:usage, non_null(:string))
    field(:content_module, non_null(:content_module))
    field(:article, non_null(:article))
  end

  object :file_user_usage_location do
    field(:usage, non_null(:string))
    field(:user, non_null(:user))
  end

  object :file_system_usage_location do
    field(:usage, non_null(:string))
  end
end
