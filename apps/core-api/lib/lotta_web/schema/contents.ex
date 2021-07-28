defmodule LottaWeb.Schema.Contents do
  @moduledoc false

  use Absinthe.Schema.Notation

  alias Lotta.Tenants

  object :contents_queries do
    field :article, :article do
      arg(:id, non_null(:id))

      resolve(&LottaWeb.ArticleResolver.get/2)
    end

    field :articles, list_of(:article) do
      arg(:category_id, :id)
      arg(:filter, :article_filter)

      resolve(&LottaWeb.ArticleResolver.all/2)
    end

    field :unpublished_articles, list_of(:article) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      resolve(&LottaWeb.ArticleResolver.all_unpublished/2)
    end

    field :own_articles, list_of(:article) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      resolve(&LottaWeb.ArticleResolver.own/2)
    end

    field :tags, list_of(non_null(:string)) do
      resolve(&LottaWeb.ArticleResolver.get_all_tags/2)
    end

    field :tag, list_of(:article) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:tag, non_null(:string))

      resolve(&LottaWeb.ArticleResolver.by_tag/2)
    end

    field :content_module_results, list_of(:content_module_result) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:content_module_id, non_null(:id))

      resolve(&LottaWeb.ContentModuleResolver.get_responses/2)
    end
  end

  object :contents_mutations do
    field :create_article, type: :article do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:article, non_null(:article_input))

      resolve(&LottaWeb.ArticleResolver.create/2)
    end

    field :update_article, type: :article do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))
      arg(:article, non_null(:article_input))

      resolve(&LottaWeb.ArticleResolver.update/2)
    end

    field :delete_article, type: :article do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))

      resolve(&LottaWeb.ArticleResolver.delete/2)
    end

    field :toggle_article_pin, type: :article do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))

      resolve(&LottaWeb.ArticleResolver.toggle_pin/2)
    end

    field :send_form_response, type: :boolean do
      arg(:content_module_id, non_null(:id))
      arg(:response, non_null(:json))

      resolve(&LottaWeb.ContentModuleResolver.send_form_response/2)
    end
  end

  object :contents_subscriptions do
    field :article_is_updated, type: :article do
      arg(:id, non_null(:id))

      config(&LottaWeb.ArticleResolver.article_is_updated_config/2)

      trigger(:update_article,
        topic: fn article ->
          prefix = Ecto.get_meta(article, :prefix)
          tenant = Tenants.get_tenant_by_prefix(prefix)

          if tenant do
            tid = tenant.id

            ["#{tid}:article:#{article.id}"]
          end
        end
      )

      resolve(fn article, _args, _info ->
        {:ok, article}
      end)
    end
  end
end
