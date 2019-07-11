defmodule Api.UploadService do
  def upload_to_space(%{localfilepath: localfilepath, file_name: file_name}) do
    bucket_name = System.get_env("UGC_S3_COMPAT_BUCKET")
    localfilepath
      |> ExAws.S3.Upload.stream_file
      |> ExAws.S3.upload(bucket_name, file_name, acl: :public_read)
      |> ExAws.request!

    %{ url: "#{System.get_env("UGC_S3_COMPAT_CDN_BASE_URL")}/#{file_name}" }
  end
end