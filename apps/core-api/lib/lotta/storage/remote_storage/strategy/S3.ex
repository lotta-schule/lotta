defmodule Lotta.Storage.RemoteStorage.Strategy.S3 do
  @moduledoc """
  S3 adapter for `Lotta.Storage.RemoteStorage`.
  Reading and writing to S3-compatible storage.
  """
  require Logger

  alias Lotta.Storage.RemoteStorageEntity
  alias Plug.Upload
  alias ExAws.S3

  def create(%Upload{path: filepath, content_type: content_type}, path, config) do
    filepath
    |> S3.Upload.stream_file()
    |> S3.upload(
      config[:config][:bucket],
      path,
      content_type: content_type
    )
    |> ExAws.request()
    |> case do
      {:ok, _status} ->
        {:ok,
         %RemoteStorageEntity{
           path: path,
           store_name: config[:name]
         }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  def delete(%RemoteStorageEntity{path: path} = entity, config) do
    S3.delete_object(config[:config][:bucket], path)
    |> ExAws.request()
    |> case do
      {:error, {error, _status_code, _binary}} ->
        {:error, error}

      {:ok, _result} ->
        entity
    end
  end

  def exists?(%RemoteStorageEntity{} = entity, config) do
    :httpc.request(:head, {get_http_url(entity, [], config), []}, [], [])
    |> case do
      {:error, {error, status_code, _binary}} ->
        if status_code == 404 do
          false
        else
          Logger.error("S3.head_object failed with unexpected error #{inspect(error)}")

          :unknown
        end

      {:ok, _result} ->
        true
    end
  end

  def get_http_url(%RemoteStorageEntity{path: path}, _options, config) do
    # This once could make files download. `Git blame` me to see how it was done.
    base_url = "#{config[:config][:endpoint]}/#{path}"

    base_url
  end
end
