defmodule Api.FileResolver do
  alias Api.Accounts
  alias Api.UploadService
  alias Repo
  alias UUID

  def upload(%{path: path, file: file}, %{context: %{context: %{ current_user: current_user, tenant: tenant }}}) do
    %{filename: filename,content_type: content_type,path: localfilepath} = file
    %{size: filesize} = File.stat! localfilepath
    oid = current_user.id + DateTime.to_unix(DateTime.utc_now) + :rand.uniform(9999)
    uuid = UUID.uuid5(:dns, "#{oid}.ugc.medienportal.org")
    %{url: remote_location} = UploadService.upload_to_space(%{localfilepath: localfilepath, file_name: uuid})
    %{}
    |> Map.put(:user_id, current_user.id)
    |> Map.put(:tenant_id, tenant.id)
    |> Map.put(:path, path)
    |> Map.put(:remote_location, remote_location)
    |> Map.put(:filename, filename)
    |> Map.put(:filesize, filesize)
    |> Map.put(:file_type, filetype_from(content_type))
    |> Map.put(:mime_type, content_type)
    |> Accounts.create_file
  end

  defp filetype_from(content_type) do
    case content_type do
      "image/png" -> "image"
      "image/jpg" -> "image"
      "image/jpeg" -> "image"
      "image/bmp" -> "image"
      "image/gif" -> "image"
      "audio/mp3" -> "audio"
      "audio/wav" -> "audio"
      "video/mp4" -> "video"
      "video/webm" -> "video"
      "application/pdf" -> "pdf"
      "x-application/pdf" -> "pdf"
      _ -> "misc"
    end
  end
end