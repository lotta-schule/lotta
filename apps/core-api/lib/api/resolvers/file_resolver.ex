defmodule Api.FileResolver do
  alias Api.Accounts
  alias Api.Accounts.{Directory,User}
  alias Api.Tenants.Tenant
  alias Api.UploadService
  alias Api.Queue.MediaConversionRequestPublisher
  alias Api.Repo
  alias UUID

  def files(%{parent_directory_id: parent_directory_id}, %{context: %{current_user: current_user}}) when is_integer(parent_directory_id) do
    parent_directory = Accounts.get_directory!(parent_directory_id)
    case User.can_read_directory?(current_user, parent_directory) do
      true ->
        {:ok, Accounts.list_files(parent_directory)}
      _ ->
        {:error, "Du hast nicht die Berechtigung, diesen Ordner zu lesen."}
    end
  end
  def files(_, _), do: {:ok, []}

  def upload(%{file: file, parent_directory_id: parent_directory_id}, %{context: %{current_user: current_user, tenant: tenant}}) do
    with directory when not is_nil(directory) <- Accounts.get_directory(parent_directory_id) do
      directory =
        directory
        |> Repo.preload([:user, :tenant])
      if User.can_write_directory?(current_user, directory) do
        upload_file_to_directory(file, directory, current_user, tenant)
      else
        {:error, "Du darfst diesen Ordner hier nicht erstellen."}
      end
    else
      _ ->
        {:error, "Der Ordner wurde nicht gefunden."}
    end
  end

  def update(%{id: id} = args, %{context: %{current_user: current_user}}) do
    try do
      file =
        Accounts.get_file!(id)
        |> Repo.preload([:tenant, :parent_directory])
      source_directory = file.parent_directory
      target_directory =
        with %{parent_directory_id: target_directory_id} <- args do
          Accounts.get_directory!(target_directory_id)
        else
          _ ->
            source_directory
        end
      if User.can_write_directory?(current_user, source_directory) && User.can_write_directory?(current_user, target_directory) do
        Accounts.update_file(file, Map.take(args, [:filename, :parent_directory_id]))
      else
        {:error, "Du darfst diese Datei nicht bearbeiten."}        
      end
    rescue
      Ecto.NoResultsError ->
        {:error, "Datei oder Ordner nicht gefunden."}
    end
  end

  def delete(%{id: id}, %{context: %{current_user: current_user}}) do
    try do
      file =
        Accounts.get_file!(id)
        |> Repo.preload([:parent_directory])
      if User.can_write_directory?(current_user, file.parent_directory) do
        file =
          file
          |> Repo.preload(:file_conversions)
        Enum.map(file.file_conversions, fn file_conversion ->
          Accounts.delete_file_conversion(file_conversion)
          Accounts.File.delete_attachment(file_conversion)
        end)
        Accounts.delete_file(file)
        Accounts.File.delete_attachment(file)
      else
        {:error, "Du darfst diese Datei nicht löschen."}
      end
    rescue
      Ecto.NoResultsError ->
        {:error, "Datei nicht gefunden."}
    end
  end

  defp upload_file_to_directory(%Plug.Upload{} = file, %Directory{} = directory, %User{} = user, %Tenant{} = tenant) do
    %{filename: filename,content_type: content_type,path: localfilepath} = file
    %{size: filesize} = File.stat! localfilepath
    oid = user.id + DateTime.to_unix(DateTime.utc_now) + :rand.uniform(9999)
    uuid = UUID.uuid5(:dns, "#{oid}.ugc.lotta.schule")
    %{url: remote_location} = UploadService.upload_to_space(%{localfilepath: localfilepath, content_type: content_type, file_name: uuid})
    %{
      user_id: user.id,
      tenant_id: tenant.id,
      parent_directory_id: directory.id,
      remote_location: remote_location,
      filename: filename,
      filesize: filesize,
      file_type: filetype_from(content_type),
      mime_type: content_type
    }
    |> Accounts.create_file()
    |> case do
      {:ok, file} ->
        MediaConversionRequestPublisher.send_conversion_request(file)
        {:ok, file}
      {:error, changeset} ->
        {
          :error,
          message: "Upload fehlgeschlagen.",
          details: error_details(changeset)
        }
    end
  end

  defp filetype_from(content_type) do
    case content_type do
      "image/png" -> "image"
      "image/jpg" -> "image"
      "image/jpeg" -> "image"
      "image/bmp" -> "image"
      "image/gif" -> "image"
      "image/svg" -> "image"
      "image/svg+xml" -> "image"
      "audio/mp3" -> "audio"
      "audio/mpeg" -> "audio"
      "audio/mpg" -> "audio"
      "audio/wav" -> "audio"
      "audio/x-wav" -> "audio"
      "audio/m4p" -> "audio"
      "audio/x-m4p" -> "audio"
      "audio/m4a" -> "audio"
      "audio/x-m4a" -> "audio"
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

  defp error_details(%Ecto.Changeset{} = changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(&ApiWeb.ErrorHelpers.translate_error/1)
  end

end