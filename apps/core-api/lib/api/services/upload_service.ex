defmodule Api.UploadService do
  @moduledoc """
    Service module for uploading user file binaries to or deleting user file binaries from s3-compatible storage
  """

  def upload_to_space(%{
        localfilepath: localfilepath,
        content_type: content_type,
        file_name: file_name
      }) do
    bucket_name = System.get_env("UGC_S3_COMPAT_BUCKET")

    localfilepath
    |> ExAws.S3.Upload.stream_file()
    |> ExAws.S3.upload(bucket_name, file_name, acl: :public_read, content_type: content_type)
    |> ExAws.request!()

    %{url: "#{System.get_env("UGC_S3_COMPAT_CDN_BASE_URL")}/#{bucket_name}/#{file_name}"}
  end

  def delete_from_space(file_name) do
    bucket_name = System.get_env("UGC_S3_COMPAT_BUCKET")

    ExAws.S3.delete_object(bucket_name, file_name)
    |> ExAws.request!()
  end
end
