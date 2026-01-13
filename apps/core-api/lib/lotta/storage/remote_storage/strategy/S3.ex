defmodule Lotta.Storage.RemoteStorage.Strategy.S3 do
  @moduledoc """
  S3 adapter for `Lotta.Storage.RemoteStorage`.
  Reading and writing to S3-compatible storage.
  """
  @behaviour Lotta.Storage.RemoteStorage.Strategy
  require Logger

  alias Lotta.Storage.{FileData, RemoteStorageEntity}

  @type config :: %{
          required(:name) => String.t(),
          required(:config) => %{
            required(:endpoint) => String.t(),
            required(:bucket) => String.t(),
            optional(:region) => String.t(),
            optional(:access_key_id) => String.t(),
            optional(:secret_access_key) => String.t()
          }
        }

  def create(%FileData{} = file_data, path, config, metadata \\ []) do
    FileData.stream!(file_data, 8 * 1024 * 1024)
    |> ExAws.S3.upload(
      config[:config][:bucket],
      path,
      content_type:
        Keyword.get(metadata, :mime_type) || Keyword.get(file_data.metadata, :mime_type),
      meta: metadata
    )
    |> ExAws.request(build_request_config(config))
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
    with {:ok, _result} <-
           config[:config][:bucket]
           |> ExAws.S3.delete_object(path)
           |> ExAws.request(build_request_config(config)) do
      :ok
    end
  end

  def exists?(%RemoteStorageEntity{} = entity, config),
    do:
      config[:config][:bucket]
      |> ExAws.S3.head_object(entity.path)
      |> ExAws.request(build_request_config(config))
      |> elem(0) == :ok

  def get_http_url(%RemoteStorageEntity{path: path}, config, options) do
    Keyword.get(options, :signed, false)
    |> case do
      false ->
        config[:config][:endpoint]
        |> Path.join(path)

      opts ->
        build_ex_aws_config(config)
        |> Map.drop([:scheme, :host, :port])
        |> ExAws.S3.presigned_url(
          :get,
          config[:config][:endpoint],
          path,
          signed_url_opts(opts) ++
            [
              bucket_as_host: true,
              virtual_host: true
            ]
        )
        |> case do
          {:ok, url} ->
            url

          {:error, _reason} ->
            nil
        end
    end
  end

  defp signed_url_opts(config) when is_list(config), do: config
  defp signed_url_opts(_), do: []

  defp build_request_config(config),
    do:
      config
      |> build_ex_aws_config()
      |> Map.to_list()

  defp build_ex_aws_config(%{config: config}) do
    opts =
      config
      |> Map.drop([:bucket, :endpoint])
      |> Map.merge(
        config[:api_endpoint]
        |> URI.parse()
        |> Map.take([:scheme, :host, :port])
      )
      |> Map.to_list()

    ExAws.Config.new(:s3, opts)
  end
end
