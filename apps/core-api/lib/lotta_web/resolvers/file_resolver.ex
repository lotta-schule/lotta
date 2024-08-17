defmodule LottaWeb.FileResolver do
  @moduledoc false

  require Logger

  import Ecto.Query
  import Lotta.Accounts.Permissions
  import LottaWeb.ErrorHelpers

  alias Ecto.Adapter.Storage
  alias LottaWeb.Context
  alias Lotta.Tenants
  alias Lotta.Tenants.Category
  alias Lotta.Accounts.{FileManagment, User}
  alias Lotta.Content.{Article, ContentModule}
  alias Lotta.Storage
  alias Lotta.Repo
  alias UUID

  def resolve_file_usage(%{parent_directory_id: parent_directory_id, id: id}, _args, %{
        context: %Context{current_user: current_user}
      })
      when not is_nil(parent_directory_id) do
    parent_directory = Storage.get_directory(parent_directory_id)

    cond do
      is_nil(parent_directory) ->
        {:error, "Ordner nicht gefunden."}

      not can_read?(current_user, parent_directory) ->
        {:error, "Du hast nicht die Berechtigung, diese Datei zu lesen."}

      true ->
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
            where: cmf.file_id == ^UUID.string_to_binary!(id),
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

        usages = categories ++ articles ++ content_modules ++ users
        {:ok, usages}
    end
  end

  def resolve_path(file_or_directory, _args, %{
        context: %Context{current_user: user}
      }) do
    {:ok, Storage.get_path(file_or_directory, user)}
  end

  def resolve_remote_location(%Storage.File{} = file, _args, _info)
      when is_struct(file, Storage.File) or is_struct(file, Storage.FileConversion) do
    {:ok, Storage.get_http_url(file)}
  end

  def resolve_remote_location(%{id: id}, _args, _info) do
    {:ok, Storage.get_http_url(Storage.get_file(id))}
  end

  def file(%{id: id}, %{context: %Context{current_user: current_user}}) do
    file =
      Storage.get_file(id)
      |> Repo.preload(:parent_directory)

    if can_read?(current_user, file.parent_directory) do
      {:ok, file}
    else
      {:error, "Du hast nicht die Rechte, diese Datei zu lesen."}
    end
  end

  def files(%{parent_directory_id: parent_directory_id}, %{
        context: %Context{current_user: current_user}
      })
      when not is_nil(parent_directory_id) do
    parent_directory = Storage.get_directory(parent_directory_id)

    cond do
      is_nil(parent_directory) ->
        {:error, "Ordner mit der id #{parent_directory_id} nicht gefunden."}

      not can_read?(current_user, parent_directory) ->
        {:error, "Du hast nicht die Rechte, diesen Ordner zu lesen."}

      true ->
        {:ok, Storage.list_files(parent_directory)}
    end
  end

  def files(_, _), do: {:ok, []}

  def search_files(%{searchterm: term}, %{context: %{current_user: user}}) do
    {:ok, Storage.search_files(user, term)}
  end

  def search_directories(%{searchterm: term}, %{context: %{current_user: user}}) do
    {:ok, Storage.search_directories(user, term)}
  end

  def relevant_files_in_usage(_args, %{context: %Context{current_user: current_user}}) do
    category_files =
      from(f in Storage.File,
        join: c in Category,
        on: c.banner_image_file_id == f.id,
        where: f.user_id == ^current_user.id
      )

    article_files =
      from(f in Storage.File,
        join: a in Article,
        on: a.preview_image_file_id == f.id,
        where: f.user_id == ^current_user.id
      )

    article_cm_files =
      from(f in Storage.File,
        join: cmf in "content_module_file",
        on: cmf.file_id == f.id,
        join: cm in ContentModule,
        on: cm.id == cmf.content_module_id,
        join: a in Article,
        on: a.id == cm.article_id,
        where: f.user_id == ^current_user.id
      )

    combined_files =
      [category_files, article_files, article_cm_files]
      |> Enum.map(&Repo.all/1)
      |> List.flatten()
      |> Enum.uniq_by(& &1.id)

    {:ok, combined_files}
  end

  def upload(%{file: file, parent_directory_id: parent_directory_id}, %{
        context: %Context{current_user: current_user, tenant: tenant}
      }) do
    directory = Storage.get_directory(parent_directory_id)
    %{size: filesize} = File.stat!(file.path)

    size_limit =
      tenant
      |> Tenants.get_configuration()
      |> Map.get(:user_max_storage_config, "-1")

    size_limit = if is_nil(size_limit), do: -1, else: String.to_integer(size_limit)

    cond do
      size_limit > -1 &&
          FileManagment.total_user_files_size(current_user) + filesize >= size_limit ->
        {:error, "Kein freier Speicher mehr."}

      is_nil(directory) ->
        {:error, "Der Ordner mit der id #{parent_directory_id} wurde nicht gefunden."}

      not can_write?(current_user, directory) ->
        {:error, "Du darfst diesen Ordner hier nicht erstellen."}

      true ->
        Storage.create_stored_file_from_upload(
          file,
          directory,
          current_user
        )
    end
  end

  def update(%{id: id} = args, %{context: %Context{current_user: current_user}}) do
    file =
      Storage.get_file(id)
      |> Repo.preload([:parent_directory])

    if is_nil(file) do
      {:error, "Die Datei mit der id #{id} wurde nicht gefunden."}
    else
      source_directory = file.parent_directory

      target_directory =
        case args do
          %{parent_directory_id: target_directory_id} ->
            Storage.get_directory(target_directory_id)

          _ ->
            source_directory
        end

      if !is_nil(target_directory) &&
           can_write?(current_user, source_directory) &&
           can_write?(current_user, target_directory) do
        Storage.update_file(file, Map.take(args, [:filename, :parent_directory_id]))
        |> format_errors("Fehler beim Bearbeiten der Datei.")
      else
        {:error, "Du hast nicht die Rechte, diese Datei zu bearbeiten."}
      end
    end
  end

  def delete(%{id: id}, %{context: %Context{current_user: current_user}}) do
    file =
      Storage.get_file(id)
      |> Repo.preload([:parent_directory])

    cond do
      is_nil(file) ->
        {:error, "Datei mit der id #{id} nicht gefunden."}

      not can_write?(current_user, file.parent_directory) ->
        {:error, "Du hast nicht die Rechte, diesen Ordner zu bearbeiten."}

      true ->
        Storage.delete_file(file)
        |> format_errors("Fehler beim Löschen der Datei.")
    end
  end
end
