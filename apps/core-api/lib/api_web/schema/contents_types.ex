defmodule ApiWeb.Schema.ContentsTypes do
  use Absinthe.Schema.Notation

  object :contents_queries do
    field :article, :article do
      arg :id, non_null(:lotta_id)
      resolve &Api.ArticleResolver.get/2
    end

    field :articles, list_of(:article) do
      arg :category_id, :lotta_id
      arg :filter, :article_filter
      resolve &Api.ArticleResolver.all/2
    end

    field :unpublished_articles, list_of(:article) do
      resolve &Api.ArticleResolver.all_unpublished/2
    end
    
    field :own_articles, list_of(:article) do
      resolve &Api.ArticleResolver.own/2
    end
    
    field :topics, list_of(:string) do
      resolve &Api.ArticleResolver.get_topics/2
    end

    field :topic, list_of(:article) do
      arg :topic, non_null(:string)
      resolve &Api.ArticleResolver.by_topic/2
    end
  end

  object :contents_mutations do
    field :create_article, type: :article do
      arg :article, non_null(:article_input)
  
      resolve &Api.ArticleResolver.create/2
    end
    
    field :update_article, type: :article do
      arg :id, non_null(:lotta_id)
      arg :article, non_null(:article_input)
  
      resolve &Api.ArticleResolver.update/2
    end
    
    field :delete_article, type: :article do
      arg :id, non_null(:lotta_id)
  
      resolve &Api.ArticleResolver.delete/2
    end

    field :toggle_article_pin, type: :article do
      arg :id, non_null(:lotta_id)

      resolve &Api.ArticleResolver.toggle_pin/2
    end
  end

  input_object :article_input do
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :title, non_null(:string)
    field :preview, :string
    field :ready_to_publish, :boolean
    field :topic, :string
    field :preview_image_file, :file
    field :groups, list_of(:user_group)
    field :category, :category
    field :content_modules, list_of(:content_module_input)
    field :users, list_of(:user)
  end

  @desc "Filtering options for the article list"
  input_object :article_filter do
    @desc "Limit the number of results to return"
    field :first, :integer
    @desc "Return only results updated before than a given date"
    field :updated_before, :naive_datetime
  end

  input_object :content_module_input do
    field :type, :content_module_type, default_value: "text"
    field :text, :string
    field :files, list_of(:file)
    field :sort_key, :integer
    field :configuration, :json
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
    field :groups, list_of(:user_group), resolve: &Api.UserGroupResolver.resolve_model_groups/2
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
    value :image_collection, as: "image_collection"
    value :video, as: "video"
    value :audio, as: "audio"
    value :download, as: "download"
    value :form, as: "form"
  end
end