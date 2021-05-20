defmodule Api.Storage.RemoteStorage.Strategy.S3 do
  alias Api.Storage.{RemoteStorage, RemoteStorageEntity}
  alias Plug.Upload
  alias ExAws.S3

  def create(%Upload{path: filepath, content_type: content_type}, path, config) do
    path =
      path
      |> RemoteStorage.get_prefixed_path()

    filepath
    |> S3.Upload.stream_file()
    |> S3.upload(
      config[:config][:bucket],
      path,
      acl: :bucket_owner_full_control,
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

  def get_http_url(%RemoteStorageEntity{path: path}, config) do
    "#{config[:config][:endpoint]}/#{config[:config][:bucket]}/#{path}"
  end
end
