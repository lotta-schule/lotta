defmodule Lotta.Storage.RemoteStorage.Strategy do
  alias Lotta.Storage.{FileData, RemoteStorage, RemoteStorageEntity}

  @callback create(
              file_data :: FileData.t(),
              path :: String.t(),
              storage_config :: RemoteStorage.config(),
              metadata :: keyword()
            ) ::
              {:ok, RemoteStorageEntity.t()} | {:error, term()}

  @callback delete(path :: String.t(), config :: RemoteStorage.config()) ::
              :ok | {:error, term()}

  @callback exists?(RemoteStorageEntity.t(), RemoteStorage.config()) :: boolean()

  @callback get_http_url(
              entity :: RemoteStorageEntity.t(),
              storage_config :: RemoteStorage.config(),
              options :: keyword()
            ) ::
              String.t() | nil
end
