defmodule LottaWeb.FileResolver do
  @moduledoc false

  require Logger

  import Ecto.Query
  import Lotta.Accounts.Permissions
  import Lotta.Storage.Conversion.AvailableFormats, only: [is_valid_category?: 1]
  import LottaWeb.ErrorHelpers

  alias LottaWeb.Urls
  alias Lotta.Storage
  alias Lotta.Tenants.Category
  alias Lotta.Accounts.User
  alias Lotta.Content.{Article, ContentModule}
  alias Lotta.Storage.{Directory, FileData}
  alias Lotta.Storage.Conversion.AvailableFormats
  alias Lotta.Worker.Conversion
  alias Lotta.Repo
  alias UUID

  def resolve_file_usage(%{parent_directory_id: parent_directory_id, id: id}, _args, %{
        context: %{current_user: current_user}
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
        context: %{current_user: user}
      }) do
    {:ok, Storage.get_path(file_or_directory, user)}
  end

  def resolve_available_formats(file, args, _info) do
    category_filter = args[:category]

    category_filter_fn = fn format_name ->
      is_nil(category_filter) ||
        AvailableFormats.get_category(format_name) ==
          AvailableFormats.get_category(category_filter)
    end

    all_possible_formats =
      AvailableFormats.available_formats_with_config(file)
      |> Enum.filter(fn {format_name, _format_config} ->
        category_filter_fn.(format_name)
      end)

    conversions =
      file
      |> Repo.preload(:file_conversions)
      |> Map.get(:file_conversions, [])
      |> Enum.filter(fn file_conversion ->
        category_filter_fn.(file_conversion.format) &&
          file_conversion.remote_storage_entity_id != nil
      end)
      |> Enum.map(&map_file_conversion_to_available_format/1)

    requestable_formats =
      all_possible_formats
      |> Enum.filter(fn {format_name, _} ->
        AvailableFormats.get_default_availability(format_name) == "requestable" and
          not Enum.any?(conversions, &(&1.name == to_string(format_name)))
      end)

    processing_formats =
      if length(requestable_formats) > 0 &&
           Enum.any?(requestable_formats, fn {format_name, _} ->
             Enum.all?(conversions, &(&1.name != to_string(format_name)))
           end) do
        Conversion.get_current_jobs(file)
        |> Enum.map(fn job ->
          {job,
           Enum.filter(requestable_formats, fn {format_name, _} ->
             to_string(AvailableFormats.get_category(format_name)) == job.args["format_category"]
           end)}
        end)
        |> Enum.filter(fn
          {_job, []} ->
            false

          _ ->
            true
        end)
        |> Enum.map(&map_job_to_available_format/1)
        |> List.flatten()
      else
        []
      end

    available_formats =
      file
      |> AvailableFormats.available_formats_with_config(for_category: category_filter)
      |> Enum.filter(fn {format, _} ->
        not Enum.any?(conversions, &(&1.name == to_string(format))) and
          not Enum.any?(processing_formats, &(&1.name == to_string(format)))
      end)
      |> Enum.map(&map_possible_format_to_available_format(file, &1))

    {:ok, conversions ++ available_formats ++ processing_formats}
  end

  defp map_job_to_available_format({job, formats}) do
    Enum.map(formats, fn {format_name, args} ->
      possible_mime_type =
        args[:mime_type] || "#{args[:type] || "application"}/#{format_name}"

      %{
        name: to_string(format_name),
        type: to_string(args[:type] || "binary"),
        mime_type: possible_mime_type,
        url: "",
        availability: %{
          status:
            case job.state do
              :discarded -> "failed"
              _ -> "processing"
            end,
          progress: 0
        }
      }
    end)
  end

  defp map_file_conversion_to_available_format(file_conversion) do
    %{
      name: file_conversion.format,
      type: file_conversion.file_type,
      mime_type: file_conversion.mime_type,
      url: Storage.get_http_url(file_conversion) || "",
      availability: %{
        status: "ready",
        progress: 100
      }
    }
  end

  defp map_possible_format_to_available_format(file, {format_name, args}) do
    format = to_string(format_name)
    availability = AvailableFormats.get_default_availability(format_name)
    possible_mime_type = args[:mime_type] || "#{args[:type] || "application"}/#{format}"

    %{
      name: format,
      type: to_string(Keyword.get(args, :type, :binary)),
      mime_type: possible_mime_type,
      url:
        if(availability == "available",
          do: Urls.get_file_path(file, format),
          else: ""
        ),
      availability: %{
        status: availability,
        progress: 0
      }
    }
  end

  def resolve_remote_location(file, _args, _info)
      when is_struct(file, Storage.File) or is_struct(file, Storage.FileConversion) do
    case Storage.get_http_url(file) do
      nil ->
        {:error, "Datei nicht gefunden."}

      url ->
        {:ok, url}
    end
  end

  def resolve_remote_location(_file, _args, _info) do
    {:error, "Ungültige Datei."}
  end

  def file(%{id: id}, %{context: %{current_user: current_user}}) do
    file =
      Storage.get_file(id, preload: [:parent_directory])

    if not is_nil(file) and can_read?(current_user, file.parent_directory) do
      {:ok, file}
    else
      {:error, "Du hast nicht die Rechte, diese Datei zu lesen."}
    end
  end

  def files(%{parent_directory_id: parent_directory_id}, %{
        context: %{current_user: current_user}
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

  def relevant_files_in_usage(_args, %{context: %{current_user: current_user}}) do
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
        context: %{current_user: current_user}
      }) do
    with {:ok, %{size: filesize}} <- Elixir.File.stat(file.path),
         %Directory{} = directory <- Storage.get_directory(parent_directory_id),
         :ok <- Storage.check_directory_space(directory, filesize),
         true <- can_write?(current_user, directory),
         {:ok, file_data} <- FileData.from_path(file.path, filename: file.filename) do
      Storage.create_file(file_data, directory, current_user)
    else
      nil ->
        {:error, "Der Ordner mit der id #{parent_directory_id} wurde nicht gefunden."}

      false ->
        {:error, "Du hast nicht die Rechte, diesen Ordner zu beschreiben."}

      {:error, reason} ->
        {:error, reason}
    end
  end

  def update(%{id: id} = args, %{context: %{current_user: current_user}}) do
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

  def delete(%{id: id}, %{context: %{current_user: current_user}}) do
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

  def request_conversion(%{category: category}, _) when not is_valid_category?(category),
    do: {:error, "Ungültige Kategorie: #{category}"}

  def request_conversion(%{id: id, category: category}, %{context: %{current_user: current_user}}) do
    file = Storage.get_file(id)

    with true <-
           can_read?(current_user, file) ||
             {:error, "Du hast nicht die Rechte, diese Datei zu lesen."},
         {:ok, _job} <-
           Conversion.get_or_create_conversion_job(
             file,
             category
           ) do
      {:ok, true}
    end
  end
end
