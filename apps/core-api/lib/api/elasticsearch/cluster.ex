defmodule Api.Elasticsearch.Cluster do
  @moduledoc """
    Elasticsearch Cluster module
  """
  use Elasticsearch.Cluster, otp_app: :api

  def init(config) do
    # replace json files with correct app_dir path
    {_, config} =
      get_and_update_in(
        config,
        [:indexes, :articles, :settings],
        &{&1, Application.app_dir(:api, &1)}
      )

    indexes_config =
      Map.keys(config.indexes)
      |> Enum.reduce(%{}, fn key, acc ->
        new_key =
          key
          |> to_string()
          |> __MODULE__.get_prefixed_index()
          |> String.to_atom()

        Map.put(acc, new_key, config.indexes[key])
      end)

    config = Map.put(config, :indexes, indexes_config)

    {:ok, config}
  end

  @doc """
  Returns an index with the cluster prefix added if one is set, or just the index if none is set.

  ### Examples
    iex> get_prefixed_index("a")
    "a"
    iex> get_prefixed_index("b")
    "prefix__b"
  """

  @doc since: "2.0.0"

  @spec get_prefixed_index(String.t()) :: String.t()

  def get_prefixed_index(index) when is_nil(index) or byte_size(index) < 1, do: index

  def get_prefixed_index(index) do
    Application.fetch_env!(:api, __MODULE__)
    |> Keyword.get(:index_prefix, "")
    |> case do
      "" -> index
      prefix -> "#{prefix}__#{index}"
    end
  end
end
