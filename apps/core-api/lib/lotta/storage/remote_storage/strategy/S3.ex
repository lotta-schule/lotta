defmodule Lotta.Storage.RemoteStorage.Strategy.S3 do
  alias Lotta.Storage.RemoteStorageEntity
  alias Plug.Upload
  alias ExAws.S3

  def create(%Upload{path: filepath, content_type: content_type}, path, config) do
    filepath
    |> S3.Upload.stream_file()
    |> S3.upload(
      config[:config][:bucket],
      path,
      grant_read: [
        uri: "http://acs.amazonaws.com/groups/global/AllUsers",
        uri: "http://acs.amazonaws.com/groups/global/AuthenticatedUsers"
      ],
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

  def get_http_url(%RemoteStorageEntity{path: path}, options, config) do
    requestDownload = Keyword.get(options, :download) == true
    baseUrl = "#{config[:config][:endpoint]}/#{config[:config][:bucket]}/#{path}"

    if requestDownload do
      "#{baseUrl}?response-content-disposition=attachment"
    else
      baseUrl
    end
  end
end
