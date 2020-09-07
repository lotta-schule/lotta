defmodule Api.FileResolver do
  @moduledoc """
    GraphQL Resolver Module for finding, creating, updating and deleting files
  """

  require Logger

  import Ecto.Query
  import Api.Accounts.Permissions

  alias Ecto.Changeset
  alias ApiWeb.ErrorHelpers
  alias Api.Accounts
  alias Api.Accounts.{Directory, User}
  alias Api.System.{Category}
  alias Api.Content.{Article, ContentModule}
  alias Api.UploadService
  alias Api.Queue.MediaConversionRequestPublisher
  alias Api.Repo
  alias UUID

  def resolve_file_usage(%{parent_directory_id: parent_directory_id, id: id}, _args, %{
        context: %{current_user: current_user}
      })
      when not is_nil(parent_directory_id) do
    parent_directory = Accounts.get_directory!(parent_directory_id)

    if user_can_read_directory?(current_user, parent_directory) do
      categories =
        from(c in Category,
          where: c.banner_image_file_id == ^id,
          order_by: [desc: :updated_at, asc: :title]
        )
        |> Repo.all()
        |> Enum.map(&%{usage: "banner", category: &1})

      articles =
        from(a in Article,
          where: a.preview_image_file_id == ^id,
          order_by: [desc: :updated_at, asc: :title]
        )
        |> Repo.all()
        |> Enum.map(&%{usage: "preview", article: &1})

      content_modules =
        from(cm in ContentModule,
          join: cmf in "content_module_file",
          on: cmf.content_module_id == cm.id,
          preload: :article,
          where: cmf.file_id == ^id,
          order_by: [desc: cm.updated_at, desc: cm.inserted_at, desc: cm.id]
        )
        |> Repo.all()
        |> Enum.map(&%{usage: "file", content_module: &1, article: &1.article})

      users =
        from(u in User,
          where: u.avatar_image_file_id == ^id,
          order_by: [:name, :nickname, :inserted_at]
        )
        |> Repo.all()
        |> Enum.map(&%{usage: "avatar", user: &1})

      # TODO: fetch from configuration
      #
      # tenants =
      #   from(t in Tenant,
      #     where: t.logo_image_file_id == ^id or t.background_image_file_id == ^id,
      #     order_by: :slug
      #   )
      #   |> Repo.all()
      #   |> Enum.map(
      #     &%{
      #       usage: if(&1.logo_image_file_id == id, do: "logo", else: "background"),
      #       tenant: &1
      #     }
      #   )

      # ++ tenants
      usages = categories ++ articles ++ content_modules ++ users
      {:ok, usages}
    else
      {:error, "Du hast nicht die Berechtigung, diese Datei zu lesen."}
    end
  end

  def file(%{id: id}, %{context: %{current_user: current_user}}) do
    file =
      Accounts.get_file!(String.to_integer(id))
      |> Repo.preload(:parent_directory)

    case file.user_id == current_user.id ||
           user_can_read_directory?(current_user, file.parent_directory) do
      true ->
        {:ok, file}

      _ ->
        {:error, "Du hast nicht die Berechtigung, diese Datei zu lesen."}
    end
  end

  def files(%{parent_directory_id: parent_directory_id}, %{context: %{current_user: current_user}})
      when not is_nil(parent_directory_id) do
    parent_directory = Accounts.get_directory!(parent_directory_id)

    case user_can_read_directory?(current_user, parent_directory) do
      true ->
        {:ok, Accounts.list_files(parent_directory)}

      _ ->
        {:error, "Du hast nicht die Berechtigung, diesen Ordner zu lesen."}
    end
  end

  def files(_, _), do: {:ok, []}

  def relevant_files_in_usage(_args, %{context: %{current_user: current_user}}) do
    category_files =
      from f in Accounts.File,
        join: c in Category,
        where: f.user_id == ^current_user.id and c.banner_image_file_id == f.id

    article_files =
      from f in Accounts.File,
        join: a in Article,
        where: f.user_id == ^current_user.id and a.preview_image_file_id == f.id

    article_cm_files =
      from f in Accounts.File,
        join: cmf in "content_module_file",
        on: cmf.file_id == f.id,
        join: cm in ContentModule,
        on: cm.id == cmf.content_module_id,
        join: a in Article,
        on: a.id == cm.article_id,
        where: f.user_id == ^current_user.id

    combined_files =
      [category_files, article_files, article_cm_files]
      |> Enum.map(&Repo.all/1)
      |> List.flatten()
      |> Enum.uniq_by(& &1.id)

    {:ok, combined_files}
  end

  def relevant_files_in_usage(_args, _context), do: {:error, "Du bist nicht angemeldet."}

  def upload(%{file: file, parent_directory_id: parent_directory_id}, %{
        context: %{current_user: current_user}
      }) do
    case Accounts.get_directory(parent_directory_id) do
      directory when not is_nil(directory) ->
        directory = Repo.preload(directory, [:user])

        if user_can_write_directory?(current_user, directory) do
          upload_file_to_directory(file, directory, current_user)
        else
          {:error, "Du darfst diesen Ordner hier nicht erstellen."}
        end

      _ ->
        {:error, "Der Ordner wurde nicht gefunden."}
    end
  end

  def update(%{id: id} = args, %{context: %{current_user: current_user}}) do
    try do
      file =
        Accounts.get_file!(String.to_integer(id))
        |> Repo.preload([:parent_directory])

      source_directory = file.parent_directory

      target_directory =
        case args do
          %{parent_directory_id: target_directory_id} ->
            Accounts.get_directory!(target_directory_id)

          _ ->
            source_directory
        end

      if user_can_write_directory?(current_user, source_directory) &&
           user_can_write_directory?(current_user, target_directory) do
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
        Accounts.get_file!(String.to_integer(id))
        |> Repo.preload([:parent_directory])

      if user_can_write_directory?(current_user, file.parent_directory) do
        Accounts.delete_file(file)
      else
        {:error, "Du darfst diese Datei nicht löschen."}
      end
    rescue
      Ecto.NoResultsError ->
        {:error, "Datei nicht gefunden."}
    end
  end

  defp upload_file_to_directory(
         %Plug.Upload{} = file,
         %Directory{} = directory,
         %User{} = user
       ) do
    %{filename: filename, content_type: content_type, path: localfilepath} = file
    %{size: filesize} = File.stat!(localfilepath)
    oid = user.id + DateTime.to_unix(DateTime.utc_now()) + :rand.uniform(9999)
    uuid = UUID.uuid5(:dns, "#{oid}.ugc.lotta.schule")

    upload_config = %{
      localfilepath: localfilepath,
      content_type: content_type,
      file_name: uuid
    }

    file = %Api.Accounts.File{
      user_id: user.id,
      parent_directory_id: directory.id,
      filename: filename,
      filesize: filesize,
      file_type: filetype_from(content_type),
      mime_type: content_type
    }

    with {:ok, %{url: remote_location}} <- UploadService.upload_to_space(upload_config),
         {:ok, file} <- Repo.insert(Map.put(file, :remote_location, remote_location)) do
      MediaConversionRequestPublisher.send_conversion_request(file)
      {:ok, file}
    else
      {:error, %Changeset{} = changeset} ->
        Logger.info(
          "There was an error creating the uploaded file in the db. Trying to rollback upload"
        )

        case UploadService.delete_from_space(uuid) do
          {:ok, _status} ->
            Logger.info("file deleted successfully from #{uuid}")

          {:error, reason} ->
            Logger.error("error deleting the file: #{inspect(reason)}")
        end

        {:error,
         [
           message: "Fehler beim Anlegen der Datei",
           details: ErrorHelpers.extract_error_details(changeset)
         ]}

      {:error, reason} ->
        Logger.error("Error uploading file to storage: #{inspect(reason)}")
        {:error, "Error uploading file to storage"}
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
end
