defmodule ApiWeb.Schema.SearchTypes do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :search_queries do
    field :search, list_of(:article) do
      arg(:search_text, non_null(:string))
      arg(:options, :search_options)
      resolve(&Api.SearchResolver.search/2)
    end
  end

  input_object :search_options do
    field :category_id, :lotta_id
  end
end
