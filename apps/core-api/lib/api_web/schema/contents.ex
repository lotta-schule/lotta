defmodule ApiWeb.Schema.Contents do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :contents_queries do
    field :article, :article do
      arg(:id, non_null(:lotta_id))
      resolve(&Api.ArticleResolver.get/2)
    end

    field :articles, list_of(:article) do
      arg(:category_id, :lotta_id)
      arg(:filter, :article_filter)
      resolve(&Api.ArticleResolver.all/2)
    end

    field :unpublished_articles, list_of(:article) do
      resolve(&Api.ArticleResolver.all_unpublished/2)
    end

    field :own_articles, list_of(:article) do
      resolve(&Api.ArticleResolver.own/2)
    end

    field :topics, list_of(:string) do
      resolve(&Api.ArticleResolver.get_topics/2)
    end

    field :topic, list_of(:article) do
      arg(:topic, non_null(:string))
      resolve(&Api.ArticleResolver.by_topic/2)
    end

    field :content_module_results, list_of(:content_module_result) do
      arg(:content_module_id, non_null(:lotta_id))
      resolve(&Api.ContentModuleResolver.get_responses/2)
    end
  end

  object :contents_mutations do
    field :create_article, type: :article do
      arg(:article, non_null(:article_input))

      resolve(&Api.ArticleResolver.create/2)
    end

    field :update_article, type: :article do
      arg(:id, non_null(:lotta_id))
      arg(:article, non_null(:article_input))

      resolve(&Api.ArticleResolver.update/2)
    end

    field :delete_article, type: :article do
      arg(:id, non_null(:lotta_id))

      resolve(&Api.ArticleResolver.delete/2)
    end

    field :toggle_article_pin, type: :article do
      arg(:id, non_null(:lotta_id))

      resolve(&Api.ArticleResolver.toggle_pin/2)
    end

    field :send_form_response, type: :boolean do
      arg(:content_module_id, non_null(:lotta_id))
      arg(:response, non_null(:json))

      resolve(&Api.ContentModuleResolver.send_form_response/2)
    end
  end
end
