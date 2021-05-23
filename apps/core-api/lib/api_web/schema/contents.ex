defmodule ApiWeb.Schema.Contents do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :contents_queries do
    field :article, :article do
      arg(:id, non_null(:id))

      resolve(&ApiWeb.ArticleResolver.get/2)
    end

    field :articles, list_of(:article) do
      arg(:category_id, :id)
      arg(:filter, :article_filter)

      resolve(&ApiWeb.ArticleResolver.all/2)
    end

    field :unpublished_articles, list_of(:article) do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      resolve(&ApiWeb.ArticleResolver.all_unpublished/2)
    end

    field :own_articles, list_of(:article) do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      resolve(&ApiWeb.ArticleResolver.own/2)
    end

    field :tags, list_of(non_null(:string)) do
      resolve(&ApiWeb.ArticleResolver.get_all_tags/2)
    end

    field :tag, list_of(:article) do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:tag, non_null(:string))

      resolve(&ApiWeb.ArticleResolver.by_tag/2)
    end

    field :content_module_results, list_of(:content_module_result) do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:content_module_id, non_null(:id))

      resolve(&ApiWeb.ContentModuleResolver.get_responses/2)
    end
  end

  object :contents_mutations do
    field :create_article, type: :article do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:article, non_null(:article_input))

      resolve(&ApiWeb.ArticleResolver.create/2)
    end

    field :update_article, type: :article do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))
      arg(:article, non_null(:article_input))

      resolve(&ApiWeb.ArticleResolver.update/2)
    end

    field :delete_article, type: :article do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))

      resolve(&ApiWeb.ArticleResolver.delete/2)
    end

    field :toggle_article_pin, type: :article do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))

      resolve(&ApiWeb.ArticleResolver.toggle_pin/2)
    end

    field :send_form_response, type: :boolean do
      arg(:content_module_id, non_null(:id))
      arg(:response, non_null(:json))

      resolve(&ApiWeb.ContentModuleResolver.send_form_response/2)
    end
  end

  object :contents_subscriptions do
    field :article_is_updated, type: :article do
      arg(:id, non_null(:id))

      config(&ApiWeb.ArticleResolver.article_is_updated_config/2)

      trigger(:update_article,
        topic: fn article ->
          ["article:#{article.id}"]
        end
      )

      resolve(fn article, _args, _info ->
        {:ok, article}
      end)
    end
  end
end
