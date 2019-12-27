defmodule Api.FileResolver do
  alias Api.Accounts
  alias Api.UploadService
  alias Api.MediaConversionPublisherWorker
  alias Repo
  alias UUID

  def all(%{}, %{context: %{current_user: current_user, tenant: tenant}}) do
    {:ok, Accounts.list_files(tenant.id, current_user.id)}
  end

  def upload(%{path: path, file: file} = args, %{context: %{current_user: current_user, tenant: tenant}}) do
    %{filename: filename,content_type: content_type,path: localfilepath} = file
    %{size: filesize} = File.stat! localfilepath
    oid = current_user.id + DateTime.to_unix(DateTime.utc_now) + :rand.uniform(9999)
    uuid = UUID.uuid5(:dns, "#{oid}.ugc.lotta.schule")
    %{url: remote_location} = UploadService.upload_to_space(%{localfilepath: localfilepath, content_type: content_type, file_name: uuid})
    {:ok, file} = %{}
    |> Map.put(:user_id, current_user.id)
    |> Map.put(:tenant_id, tenant.id)
    |> Map.put(:is_public, (Accounts.User.is_admin?(current_user, tenant) && args[:is_public]) == true)
    |> Map.put(:path, path)
    |> Map.put(:remote_location, remote_location)
    |> Map.put(:filename, filename)
    |> Map.put(:filesize, filesize)
    |> Map.put(:file_type, filetype_from(content_type))
    |> Map.put(:mime_type, content_type)
    |> Accounts.create_file(Accounts.User.is_admin?(current_user, tenant))
    MediaConversionPublisherWorker.send_conversion_request(file)
    {:ok, file}
  end

  def move(%{id: id} = args, %{context: %{current_user: current_user}}) do
    try do
      file = Accounts.get_file!(id)
      |> Api.Repo.preload(:tenant)
      case Accounts.File.is_author?(file, current_user) || ((file.is_public || args[:is_public] == true) && Accounts.User.is_admin?(current_user, file.tenant)) do
        true ->
          Accounts.move_file(file, args, Accounts.User.is_admin?(current_user, file.tenant))
        false ->
          {:error, "Du darfst diese Datei nicht verschieben."}        
      end
    rescue
      Ecto.NoResultsError -> {:error, "Datei mit der id #{id} nicht gefunden."}
    end
  end

  def delete(%{id: id}, %{context: %{current_user: current_user}}) do
    try do
      file = Accounts.get_file!(id)
      |> Api.Repo.preload(:tenant)
      case Accounts.File.is_author?(file, current_user) || (file.is_public && Accounts.User.is_admin?(current_user, file.tenant)) do
        true ->
          file = Api.Repo.preload(file, :file_conversions)
          Enum.map(file.file_conversions, fn file_conversion ->
            Accounts.delete_file_conversion(file_conversion)
            Accounts.File.delete_attachment(file_conversion)
          end)
          Accounts.delete_file(file)
          Accounts.File.delete_attachment(file)
        false ->
          {:error, "Du darfst diese Datei nicht löschen."}
      end
    rescue
      Ecto.NoResultsError -> {:error, "Datei mit der id #{id} nicht gefunden."}
    end
  end

  defp filetype_from(content_type) do
    case content_type do
      "image/png" -> "image"
      "image/jpg" -> "image"
      "image/jpeg" -> "image"
      "image/bmp" -> "image"
      "image/gif" -> "image"
      "audio/mp3" -> "audio"
      "audio/mpeg" -> "audio"
      "audio/mpg" -> "audio"
      "audio/wav" -> "audio"
      "audio/x-wav" -> "audio"
      "video/mp4" -> "video"
      "video/webm" -> "video"
      "video/mov" -> "video"
      "video/m4v" -> "video"
      "video/x-m4v" -> "video"
      "video/quicktime" -> "video"
      "application/pdf" -> "pdf"
      "x-application/pdf" -> "pdf"
      _ -> "misc"
    end
  end
end