defprotocol Lotta.Storage.RemoteStorage.Strategy do
  alias Lotta.Storage.{FileData, RemoteStorage, RemoteStorageEntity}

  @doc """
  Create a file on the remote storage given an elixir file object
  """
  @spec create(
          file_data :: FileData.t(),
          path :: String.t(),
          storage_config :: RemoteStorage.config(),
          metadata :: keyword()
        ) ::
          {:ok, RemoteStorageEntity.t()} | {:error, term()}
  def create(file, path, config, metadata \\ [])

  @doc """
  Delete a file on the storage for the given entity
  """
  @spec delete(RemoteStorageEntity.t(), RemoteStorage.config()) :: :ok | {:error, term()}
  def delete(remote_storage_entity, config)

  @doc """
  Delete a file on the storage for the given entity
  """
  @doc since: "4.1.3"
  @spec exists?(RemoteStorageEntity.t(), RemoteStorage.config()) :: boolean()
  def exists?(remote_storage_entity, config)

  @doc """
  Get the http URL for a given entity
  """
  @spec get_http_url(
          entity :: RemoteStorageEntity.t(),
          storage_config :: RemoteStorage.config(),
          options :: keyword()
        ) ::
          String.t() | nil
  def get_http_url(remote_storage_entity, config, opts \\ [])
end
