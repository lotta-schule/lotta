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

    field(:formats, non_null(list_of(non_null(:available_format)))) do
      resolve(&LottaWeb.FileResolver.resolve_available_formats/3)
    end

    field(:usage, non_null(list_of(non_null(:file_usage_location))),
      resolve: &LottaWeb.FileResolver.resolve_file_usage/3
    )
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

  object :available_format do
    field(:name, non_null(:conversion_format))
    field(:url, non_null(:string))
    field(:type, non_null(:file_type))
    field(:status, non_null(:format_status))
  end

  enum :format_status do
    value(:ready, as: "ready")
    value(:available, as: "available")
    value(:requestable, as: "requestable")
  end

  enum :conversion_format do
    value(:original, as: "original")
    value(:preview_200, as: "preview_200")
    value(:preview_400, as: "preview_400")
    value(:preview_800, as: "preview_800")
    value(:preview_1200, as: "preview_1200")
    value(:preview_1600, as: "preview_1600")
    value(:preview_2400, as: "preview_2400")
    value(:preview_3200, as: "preview_3200")
    value(:avatar_50, as: "avatar_50")
    value(:avatar_100, as: "avatar_100")
    value(:avatar_250, as: "avatar_250")
    value(:avatar_500, as: "avatar_500")
    value(:avatar_1000, as: "avatar_1000")
    value(:logo_300, as: "logo_300")
    value(:logo_600, as: "logo_600")
    value(:banner_330, as: "banner_330")
    value(:banner_660, as: "banner_660")
    value(:banner_990, as: "banner_990")
    value(:banner_1320, as: "banner_1320")
    value(:article_preview_300, as: "article_preview_300")
    value(:article_preview_420, as: "article_preview_420")
    value(:article_preview_600, as: "article_preview_600")
    value(:article_preview_840, as: "article_preview_840")
    value(:pagebg_1024, as: "pagebg_1024")
    value(:pagebg_1280, as: "pagebg_1280")
    value(:pagebg_1920, as: "pagebg_1920")
    value(:pagebg_2560, as: "pagebg_2560")
    value(:icon_64, as: "icon_64")
    value(:icon_128, as: "icon_128")
    value(:icon_256, as: "icon_256")
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
    value(:binary, as: "binary")
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
