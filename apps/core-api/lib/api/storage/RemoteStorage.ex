defmodule Api.Storage.RemoteStorage do
  @type config :: %{
          name: String.t(),
          type: module(),
          config: map()
        }

  @spec config_for_store(String.t()) :: config()
  def config_for_store(store_name) do
    config = Application.fetch_env!(:api, __MODULE__)

    storage_configs =
      config
      |> Keyword.get(:storages)

    storage_configs
    |> Map.fetch!(store_name)
    |> Map.put(:name, store_name)
  end

  @spec default_store() :: String.t()
  def default_store do
    Application.fetch_env!(:api, __MODULE__)
    |> Keyword.get(:default_storage, "")
  end

  @spec get_strategy(String.t() | nil) :: module()
  def get_strategy(store_name \\ default_store()) do
    config =
      store_name
      |> config_for_store()

    config
    |> Map.fetch!(:type)
  end

  @doc """
  Returns a path with the global prefix attached if any is set in the config
  """
  @doc since: "2.5.0"
  @spec get_prefixed_path(String.t()) :: String.t()
  def get_prefixed_path(path) do
    Application.fetch_env!(:api, __MODULE__)
    |> Keyword.get(:prefix)
    |> case do
      nil ->
        [path]

      prefix ->
        [prefix, path]
    end
    |> Enum.join("/")
  end

  @doc """
  Create a file on the remote storage given an elixir file object
  """
  @spec create(%Plug.Upload{} | %URI{}, String.t()) ::
          {:ok, RemoteStorageEntity} | {:error, term()}
  def create(file, path) do
    get_strategy().create(file, path, config_for_store(default_store()))
  end

  @doc """
  Delete a file on the storage for the given entity
  """
  @spec delete(RemoteStorageEntity) :: :ok | {:error, term()}
  def delete(nil), do: :ok

  def delete(remote_storage_entity) do
    get_strategy(remote_storage_entity.store_name).delete(
      remote_storage_entity,
      config_for_store(remote_storage_entity.store_name)
    )
  end

  @doc """
  Get the http URL for a given entity
  """
  @spec get_http_url(RemoteStorageEntity) :: {:ok, %URI{}} | {:error, term()}
  def get_http_url(nil), do: nil

  def get_http_url(remote_storage_entity) do
    get_strategy(remote_storage_entity.store_name).get_http_url(
      remote_storage_entity,
      config_for_store(remote_storage_entity.store_name)
    )
  end
end
