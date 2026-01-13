defmodule Lotta.Storage.RemoteStorage do
  @moduledoc """
  Handle remote storage for user-generated content.
  Manges writing and reading to different stores.
  """
  alias Lotta.Storage.{FileData, RemoteStorageEntity}
  require Logger

  @type config :: %{
          name: String.t(),
          type: module(),
          config: map()
        }

  @type get_http_url_options :: [download: boolean()]

  @doc """
  Get the config for a given store (identified by name). Returns an :error-Tuple if the store is not available

  ## Examples

  iex> config_for_store("minio")
  {:ok, %{name: "minio", type: Strategy.S3, config: %{}}}

  iex> config_for_store("IMPOSSIBLE")
  {:error, :unknown_store}
  """
  @doc since: "2.5.0"
  @spec config_for_store(String.t() | nil) :: {:ok, config()} | {:error, :unknown_store}
  def config_for_store(store_name \\ default_store()) do
    Application.fetch_env!(:lotta, __MODULE__)
    |> Keyword.get(:storages)
    |> case do
      %{^store_name => config} ->
        {:ok, Map.put(config, :name, store_name)}

      _ ->
        {:error, :unknown_store}
    end
  end

  @doc """
  Get the name of the default store

  ## Examples

      iex> default_store()
      "dev-data"
  """
  @doc since: "2.5.0"
  @spec default_store() :: String.t()
  def default_store do
    Keyword.get(
      Application.fetch_env!(:lotta, __MODULE__),
      :default_storage,
      ""
    )
  end

  @doc """
  Get the stragegy set for a given store name, or, if none is given, for the default store.
  """
  @doc since: "2.5.0"
  @spec get_strategy(String.t() | nil) :: {:ok, module()} | {:error, :unknown_store}
  def get_strategy(store_name \\ default_store()) do
    case config_for_store(store_name) do
      {:ok, %{type: strategy}} ->
        {:ok, strategy}

      error ->
        error
    end
  end

  @doc """
  Create a file on the remote storage given a `Lotta.Storage.FileData` struct.
  Returns an (unsaved[!]) RemoteStorageEntity in a result tuple.

  !!! WARNING !!!
  This does not create an entry in the database.
  Call Repo.save! on the returned RemoteStorageEntity to persist it.
  """
  @spec create(FileData.t(), path :: String.t(), metadata :: keyword()) ::
          {:ok, RemoteStorageEntity.t()} | {:error, term()}
  def create(%FileData{} = file, path, meta \\ []) do
    with {:ok, strategy} <- get_strategy(),
         {:ok, config} <- config_for_store(default_store()) do
      Logger.debug("Using storage strategy #{inspect(strategy)} to upload file to #{path}")
      strategy.create(file, path, config, meta)
    end
  end

  @doc """
  Delete a file on the storage for the given entity

  !!! WARNING !!!
  This does not delete the database object, only the file on the storage.
  """
  @spec delete(RemoteStorageEntity.t()) :: {:ok, RemoteStorageEntity.t()} | {:error, term()}
  def delete(%RemoteStorageEntity{path: path, store_name: store} = entity) do
    with {:ok, strategy} <- get_strategy(store),
         {:ok, config} <- config_for_store(store),
         :ok <- strategy.delete(path, config) do
      {:ok, entity}
    end
  end

  @doc """
  Check if a file exists on the storage for the given entity
  """
  @doc since: "4.1.3"
  @spec exists?(RemoteStorageEntity.t()) :: boolean() | :unknown
  def exists?(%RemoteStorageEntity{store_name: store} = entity) do
    with {:ok, strategy} <- get_strategy(store),
         {:ok, config} <- config_for_store(store) do
      strategy.exists?(entity, config)
    else
      _ ->
        :unknown
    end
  end

  @doc """
  Get the http URL for a given entity: Returns null if the URL cannot be found.
  """
  @spec get_http_url(RemoteStorageEntity.t(), get_http_url_options() | nil) :: String.t() | nil
  def get_http_url(%RemoteStorageEntity{} = remote_storage_entity, opts \\ []) do
    with {:ok, strategy} <- get_strategy(remote_storage_entity.store_name),
         {:ok, config} <- config_for_store(remote_storage_entity.store_name) do
      strategy.get_http_url(remote_storage_entity, config, opts)
    else
      _ ->
        nil
    end
  end
end
