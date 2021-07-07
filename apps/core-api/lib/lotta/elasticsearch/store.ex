defmodule Lotta.Elasticsearch.Store do
  @moduledoc false

  @behaviour Elasticsearch.Store

  alias Lotta.Repo
  alias Lotta.Tenants

  @impl true
  def stream(schema) do
    Tenants.list_tenants()
    |> Stream.flat_map(&Repo.all(schema, prefix: &1.prefix))
  end

  @impl true
  def transaction(fun) do
    {:ok, result} = Repo.transaction(fun, timeout: :infinity)
    result
  end
end
