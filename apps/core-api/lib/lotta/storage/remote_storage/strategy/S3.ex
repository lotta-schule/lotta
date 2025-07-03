defmodule Lotta.Storage.RemoteStorage.Strategy.S3 do
  @moduledoc """
  S3 adapter for `Lotta.Storage.RemoteStorage`.
  Reading and writing to S3-compatible storage.
  """
  @behaviour Lotta.Storage.RemoteStorage.Strategy
  require Logger

  alias Lotta.Storage.{FileData, RemoteStorageEntity}
  alias ExAws.S3

  def create(%FileData{} = file_data, path, config, metadata \\ []) do
    FileData.stream!(file_data, 8 * 1024 * 1024)
    |> S3.upload(
      config[:config][:bucket],
      path,
      content_type:
        Keyword.get(metadata, :mime_type) || Keyword.get(file_data.metadata, :mime_type),
      meta: metadata
    )
    |> ExAws.request()
    |> case do
      {:ok, _response} ->
        {:ok,
         %RemoteStorageEntity{
           path: path,
           store_name: config[:name]
         }}

      {:error, reason} ->
        Logger.error("S3.upload of #{file_data} failed with error #{inspect(reason)}")
        {:error, reason}
    end
  end

  def delete(path, config) do
    S3.delete_object(config[:config][:bucket], path)
    |> ExAws.request()
    |> case do
      {:error, {error, _status_code, _binary}} ->
        {:error, error}

      {:ok, _result} ->
        :ok
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

  def get_http_url(%RemoteStorageEntity{path: path}, config, _options) do
    # This once could make files download. `Git blame` me to see how it was done.
    base_url = "#{config[:config][:endpoint]}/#{path}"

    base_url
  end
end
