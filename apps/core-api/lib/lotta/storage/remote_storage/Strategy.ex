defprotocol Lotta.Storage.RemoteStorage.Strategy do
  alias Lotta.Storage.RemoteStorageEntity
  alias Lotta.Storage.RemoteStorage

  @doc """
  Create a file on the remote storage given an elixir file object
  """
  @spec create(%Plug.Upload{}, String.t(), RemoteStorage.config()) ::
          {:ok, RemoteStorageEntity} | {:error, term()}
  def create(file, path, config)

  @doc """
  Delete a file on the storage for the given entity
  """
  @spec delete(RemoteStorageEntity, RemoteStorage.config()) :: :ok | {:delete, term()}
  def delete(remote_storage_entity, config)

  @doc """
  Get the http URL for a given entity
  """
  @spec get_http_url(RemoteStorageEntity, RemoteStorage.config()) ::
          {:ok, %URI{}} | {:error, term()}
  def get_http_url(remote_storage_entity, config)
end
