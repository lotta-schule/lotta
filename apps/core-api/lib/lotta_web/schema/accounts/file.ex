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
    field(:mime_type, :string)

    field(:remote_location, non_null(:string),
      resolve: &LottaWeb.FileResolver.resolve_remote_location/3
    )

    field(:file_type, non_null(:file_type))
    field(:user_id, :id)
    field(:user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Accounts))

    field(:parent_directory, :directory,
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Storage)
    )

    field(:path, non_null(list_of(non_null(:directory))),
      resolve: &LottaWeb.FileResolver.resolve_path/3
    )

    field(:formats, non_null(list_of(non_null(:available_format)))) do
      arg(:category, :string, description: "Return only formats for this category")

      arg(:availability, :format_availability_status,
        description: "Return only formats with this availability status"
      )

      resolve(&LottaWeb.FileResolver.resolve_available_formats/3)
    end

    field(:metadata, :json)

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
  end

  object :available_format do
    field(:name, non_null(:conversion_format))
    field(:url, :string)
    field(:type, non_null(:file_type))
    field(:mime_type, non_null(:string))

    field(:availability, non_null(:format_availability))
  end

  object :format_availability do
    field(:status, non_null(:format_availability_status))

    field(:progress, :integer)
    field(:error, :string)
  end

  enum :format_availability_status do
    value(:ready, as: "ready")
    value(:available, as: "available")
    value(:requestable, as: "requestable")
    value(:processing, as: "processing")
    value(:failed, as: "failed")
  end

  enum :conversion_format do
    value(:original, as: "original")
    value(:preview_200, as: "preview_200")
    value(:preview_400, as: "preview_400")
    value(:preview_800, as: "preview_800")

    value(:present_1200, as: "present_1200")
    value(:present_1600, as: "present_1600")
    value(:present_2400, as: "present_2400")
    value(:present_3200, as: "present_3200")
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
    value(:articlepreview_99, as: "articlepreview_99")
    value(:articlepreview_165, as: "articlepreview_165")
    value(:articlepreview_330, as: "articlepreview_330")
    value(:articlepreview_660, as: "articlepreview_660")
    value(:articlepreview_990, as: "articlepreview_990")
    value(:pagebg_1024, as: "pagebg_1024")
    value(:pagebg_1280, as: "pagebg_1280")
    value(:pagebg_1920, as: "pagebg_1920")
    value(:pagebg_2560, as: "pagebg_2560")
    value(:icon_64, as: "icon_64")
    value(:icon_128, as: "icon_128")
    value(:icon_256, as: "icon_256")

    value(:poster_1080p, as: "poster_1080p")
    value(:videoplay_200p_webm, as: "videoplay_200p-webm")
    value(:videoplay_480p_webm, as: "videoplay_480p-webm")
    value(:videoplay_720p_webm, as: "videoplay_720p-webm")
    value(:videoplay_1080p_webm, as: "videoplay_1080p-webm")
    value(:videoplay_200p_mp4, as: "videoplay_200p-mp4")
    value(:videoplay_480p_mp4, as: "videoplay_480p-mp4")
    value(:videoplay_720p_mp4, as: "videoplay_720p-mp4")
    value(:videoplay_1080p_mp4, as: "videoplay_1080p-mp4")

    value(:audioplay_aac, as: "audioplay_aac")
    value(:audioplay_ogg, as: "audioplay_ogg")
  end

  enum :file_type do
    value(:image, as: "image")
    value(:audio, as: "audio")
    value(:video, as: "video")
    value(:pdf, as: "pdf")
    value(:misc, as: "misc")
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
