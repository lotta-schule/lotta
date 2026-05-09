defmodule LottaWeb.Schema.Contents.Article do
  @moduledoc false

  use Absinthe.Schema.Notation

  input_object :article_input do
    field(:inserted_at, :datetime)
    field(:updated_at, :datetime)
    field(:title, non_null(:string))
    field(:preview, :string)
    field(:ready_to_publish, :boolean)
    field(:published, :boolean)
    field(:is_reactions_enabled, :boolean)
    field(:tags, list_of(non_null(:string)))
    field(:preview_image_file, :select_file_input)
    field(:groups, list_of(:select_user_group_input))
    field(:category, :select_category_input)
    field(:content_modules, list_of(:content_module_input))
    field(:users, list_of(:select_user_input))
  end

  @desc "Filtering options for the article list"
  input_object :article_filter do
    field(:updated_before, :datetime,
      description: "Return only results updated before than a given date"
    )

    field(:first, :integer, description: "Limit the number of results to return")
  end

  input_object :content_module_input do
    field(:id, :id)
    field(:type, :content_module_type, default_value: "text")
    field(:content, :json)
    field(:files, list_of(:select_file_input))
    field(:sort_key, :integer)
    field(:configuration, :json)
  end

  object :article do
    field(:id, non_null(:id))
    field(:inserted_at, non_null(:datetime))
    field(:updated_at, non_null(:datetime))
    field(:title, non_null(:string))
    field(:preview, :string)
    field(:tags, list_of(non_null(:string)))
    field(:ready_to_publish, :boolean)
    field(:published, :boolean)
    field(:is_pinned_to_top, :boolean)
    field(:is_reactions_enabled, :boolean)

    field(:preview_image_file, :file,
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Storage)
    )

    field(:groups, non_null(list_of(non_null(:user_group))),
      resolve: &LottaWeb.UserGroupResolver.resolve_model_groups/3
    )

    field(:content_modules, non_null(list_of(non_null(:content_module))),
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Content)
    )

    field(:users, non_null(list_of(non_null(:user))),
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Accounts)
    )

    field(:category, :category, resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Tenants))

    field(:reaction_counts, list_of(non_null(:article_reaction_count)),
      resolve: &LottaWeb.ArticleReactionResolver.resolve_article_reaction_counts/2
    )
  end

  object :article_reaction_count do
    field(:type, :article_reaction_type)
    field(:count, :integer)
  end

  object :content_module do
    field(:id, :id)
    field(:inserted_at, :datetime)
    field(:updated_at, :datetime)
    field(:type, :content_module_type)
    field(:content, :json)
    field(:files, list_of(:file), resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Storage))
    field(:sort_key, :integer)
    field(:configuration, :json)
  end

  object :content_module_result do
    field(:id, :id)
    field(:inserted_at, :datetime)
    field(:updated_at, :datetime)
    field(:result, :json)
    field(:user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Accounts))
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
    value(:divider, as: "divider")
  end

  enum :article_reaction_type do
    value(:heart, as: "HEART")
    value(:heart_crack, as: "HEART_CRACK")
    value(:face_smile, as: "FACE_SMILE")
    value(:face_flushed, as: "FACE_FLUSHED")
    value(:lemon, as: "LEMON")
    value(:pepper, as: "PEPPER")
    value(:thumb_up, as: "THUMB_UP")
    value(:skull, as: "SKULL")
  end
end
