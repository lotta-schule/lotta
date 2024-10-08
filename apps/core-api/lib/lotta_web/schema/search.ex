defmodule LottaWeb.Schema.Search do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :search_queries do
    field(:search, list_of(:article)) do
      arg(:search_text, non_null(:string))
      arg(:options, :search_options)
      resolve(&LottaWeb.SearchResolver.search/2)
    end
  end

  input_object :search_options do
    field(:category_id, :id)
  end
end
