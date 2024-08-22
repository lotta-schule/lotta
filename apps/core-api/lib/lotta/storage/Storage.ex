defmodule Lotta.Storage do
  @moduledoc """
  Handles storage for files uploaded by the user.
  """
  require Logger

  import Ecto.Query

  alias Plug.Upload
  alias Ecto.Multi
  alias Ecto.Changeset
  alias Lotta.Repo
  alias Lotta.Accounts.User
  alias Lotta.Queue.MediaConversionRequestPublisher
  alias Lotta.Storage.{Directory, ImageProcessingUrl, RemoteStorage, RemoteStorageEntity}

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2)
  end

  def query(queryable, _params) do
    queryable
  end

  @doc """
  Upload a file to a given directory for a given user.
  Creates the file object in the database and stores the data in the
  default RemoteStorage.
  """
  @doc since: "2.5.0"
  @spec create_stored_file_from_upload(Upload.t(), Directory.t(), User.t()) ::
          {:ok, Lotta.Storage.File.t()} | {:error, term()}
  def create_stored_file_from_upload(
        %Upload{} = upload,
        %Directory{} = directory,
        %User{} = user
      ) do
    %{
      filename: filename,
      content_type: content_type,
      path: localfilepath
    } = upload

    %{size: filesize} = File.stat!(localfilepath)

    file =
      directory
      |> Repo.build_prefixed_assoc(:files, %{
        user_id: user.id,
        filename: filename,
        filesize: filesize,
        file_type: filetype_from(content_type),
        mime_type: content_type
      })

    Multi.new()
    |> Multi.insert(:file, file)
    |> Multi.run(:entity_data, fn _repo, %{file: file} ->
      prefix = Ecto.get_meta(file, :prefix)
      RemoteStorage.create(upload, "#{prefix}/#{file.id}")
    end)
    |> Multi.insert(:remote_storage_entity, fn %{entity_data: entity_data} ->
      Repo.build_prefixed_assoc(file, :remote_storage_entity, entity_data)
    end)
    |> Multi.update(:complete_file, fn %{file: file, remote_storage_entity: remote_storage_entity} ->
      file
      |> Repo.preload(:remote_storage_entity)
      |> Changeset.change()
      |> Changeset.put_assoc(:remote_storage_entity, remote_storage_entity)
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{complete_file: file}} ->
        MediaConversionRequestPublisher.send_conversion_request(file)
        {:ok, file}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Change the Remote storage of the file, that means, move file data to another location,
  and create a new RemoteStorage entity for the file.
  The old RemoteStorage entity will be kept, as the file itself is not changed.
  """
  @doc since: "2.5.0"
  @spec copy_to_remote_storage(Api.Storage.File.t() | Api.Storage.FileConversion.t(), String.t()) ::
          {:ok, Api.Storage.File.t()} | {:error, Changeset.t()} | {:error, atom()}
  def copy_to_remote_storage(file, store_name) when is_binary(store_name) do
    file_or_file_conversion = Repo.preload(file, :remote_storage_entity)

    filepath = Path.join(System.tmp_dir(), file.id)

    # first fetch the file data
    file_url =
      file_or_file_conversion.remote_storage_entity
      |> RemoteStorage.get_http_url()
      |> String.to_charlist()

    with {:ok, :saved_to_file} <-
           :httpc.request(:get, {file_url, []}, [], stream: String.to_charlist(filepath)),
         {:ok, entity} <-
           RemoteStorage.create(
             %Upload{
               filename:
                 case file_or_file_conversion do
                   %{filename: filename} ->
                     filename

                   _ ->
                     ""
                 end,
               content_type: file.mime_type,
               path: filepath
             },
             "#{Ecto.get_meta(file, :prefix)}/" <>
               case file_or_file_conversion do
                 %{file_id: fileid, id: id} ->
                   Path.join(fileid <> "-conversion", id)

                 %{id: id} ->
                   id
               end
           ) do
      File.rm(filepath)

      file
      |> Repo.preload(:remote_storage_entity)
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_assoc(:remote_storage_entity, entity)
      |> Repo.update()
    else
      {:ok, {{_, _status_code, status_text}, _headers, body}} ->
        Logger.error(body)

        {:error,
         status_text
         |> IO.chardata_to_string()
         |> String.downcase()
         |> String.to_atom()}

      error ->
        error
    end
  end

  @doc """
  List all RemoteStorageEntity records that are not referenced by any File or FileConversion
  """
  @doc since: "4.1.2"
  @spec list_unused_remote_storage_entities(prefix :: String.t() | nil) :: [RemoteStorage.t()]
  def list_unused_remote_storage_entities(prefix \\ nil) do
    from(rse in RemoteStorageEntity,
      as: :remote_storage_entity,
      where:
        not exists(
          from(f in Lotta.Storage.File,
            where: parent_as(:remote_storage_entity).id == f.remote_storage_entity_id
          )
        ) and
          not exists(
            from(fc in Lotta.Storage.FileConversion,
              where: parent_as(:remote_storage_entity).id == fc.remote_storage_entity_id
            )
          ),
      order_by: [:id]
    )
    |> Repo.all(prefix: prefix)
  end

  @doc """
  List root directories for a user
  """
  @doc since: "2.5.0"
  @spec list_root_directories(User.t()) :: [Directory.t()]
  def list_root_directories(%User{} = user) do
    from(d in Directory,
      where:
        is_nil(d.parent_directory_id) and
          (d.user_id == ^user.id or is_nil(d.user_id)),
      order_by: [fragment("? DESC NULLS LAST", d.user_id), :name]
    )
    |> Repo.all()
  end

  @doc """
  List a directory's subdirectories
  """
  @doc since: "2.5.0"
  @spec list_directories(Directory.t()) :: [Directory.t()]
  def list_directories(%Directory{} = directory) do
    from(d in Directory,
      where: d.parent_directory_id == ^directory.id,
      order_by: [:name]
    )
    |> Repo.all()
  end

  @doc """
  Gets a single directory.

  returns nil if the Directory does not exist

  ## Examples

      iex> get_directory(123)
      %Directory{}

      iex> get_directory(456)
      nil

  """
  @doc since: "2.5.0"
  @spec get_directory(String.t()) :: Directory.t() | nil
  def get_directory(id), do: Repo.get(Directory, id)

  @doc """
  Creates a Directory for a given user.
  """
  @doc since: "2.5.0"
  @spec create_directory(map(), keyword()) :: {:ok, Directory.t()} | {:error, Changeset.t()}
  def create_directory(attrs, opts \\ [prefix: Repo.get_prefix()]) do
    %Directory{}
    |> Directory.changeset(attrs)
    |> Repo.insert(opts)
  end

  @doc """
  Create the default directories for a new user
  """
  @doc since: "2.5.0"
  @spec create_new_user_directories(User.t()) :: [term()]
  def create_new_user_directories(%User{} = user) do
    ["Mein Profil", "Meine Bilder", "Meine Dokumente", "Meine Videos", "Meine Tondokumente"]
    |> Enum.map(fn name ->
      create_directory(
        %{
          name: name,
          user_id: user.id
        },
        prefix: Ecto.get_meta(user, :prefix)
      )
    end)
  end

  @doc """
  Updates a directory.

  ## Examples

      iex> update_directory(directory, path)
      {:ok, %Directory{}}

  """
  @doc since: "2.5.0"
  @spec update_directory(Directory.t(), map()) :: {:ok, Directory.t()} | {:error, Changeset.t()}
  def update_directory(%Directory{} = directory, attrs) do
    directory
    |> Directory.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Directory.

  ## Examples

      iex> delete_directory(directory)
      {:ok, %Directory{}}

      iex> delete_directory(directory)
      {:error, %Ecto.Changeset{}}

  """
  @doc since: "2.5.0"
  @spec delete_directory(Directory.t()) :: {:ok, Directory.t()} | {:error, Changeset.t()}
  def delete_directory(%Directory{} = directory) do
    Repo.delete(directory)
  end

  @doc """
  Returns the list of files for a given directory

  ## Examples

      iex> list_files()
      [%File{}, ...]

  """
  @doc since: "2.5.0"
  @spec list_files(Directory.t()) :: [Directory.t()]
  def list_files(%Directory{} = parent_directory) do
    from(f in Lotta.Storage.File,
      where: f.parent_directory_id == ^parent_directory.id,
      order_by: [:filename]
    )
    |> Repo.all()
  end

  @doc """
  Gets a single file.
  Returns `nil` if file is not found.

  ## Examples

      iex> get_file(123)
      %File{}

      iex> get_file(456)
      ** (Ecto.NoResultsError)

  """
  @doc since: "2.5.0"
  @spec get_file(Lotta.Storage.File.id()) :: Lotta.Storage.File.t() | nil
  def get_file(id), do: Repo.get(Lotta.Storage.File, id)

  @doc """
  Gets a single file_conversion.
  Returns `nil` if file_conversion is not found.

  ## Examples

      iex> get_file_conversion(123)
      %File{}

      iex> get_file_conversion(456)
      ** (Ecto.NoResultsError)

  """
  @doc since: "2.5.0"
  @spec get_file_conversion(Lotta.Storage.FileConversion.id()) ::
          Lotta.Storage.FileConversion.t() | nil
  def get_file_conversion(id), do: Repo.get(Lotta.Storage.FileConversion, id)

  @doc """
  Updates a file.

  ## Examples

      iex> update_file(file, path)
      {:ok, %File{}}

  """
  @doc since: "2.5.0"
  def update_file(%Lotta.Storage.File{} = file, attrs) do
    file
    |> Lotta.Storage.File.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a File AND all its dependend conversions

  ## Examples

      iex> delete_file(file)
      {:ok, %File{}}

      iex> delete_file(file)
      {:error, %Ecto.Changeset{}}

  """
  @doc since: "2.5.0"
  @spec delete_file(Lotta.Storage.File.t()) ::
          {:ok, Lotta.Storage.File.t()} | {:error, Ecto.Changeset.t()}
  def delete_file(%Lotta.Storage.File{} = file) do
    file =
      file
      |> Repo.preload([:file_conversions, :remote_storage_entity])

    Enum.each(file.file_conversions, fn file_conversion ->
      file_conversion =
        file_conversion
        |> Repo.preload(:remote_storage_entity)

      if file_conversion.remote_storage_entity do
        RemoteStorage.delete(file_conversion.remote_storage_entity)
      end

      Repo.delete(file_conversion)
    end)

    if file.remote_storage_entity do
      RemoteStorage.delete(file.remote_storage_entity)
    end

    Repo.delete(file)
  end

  @doc """
  Searches for files with filenames matching a given string

  # Examples
    iex> search_files(user, "house")
    [%File{filename: "house_poem.txt", ...}, %File{filename: "image_house.png", ...}]
  """
  @doc since: "5.0.0"
  @spec search_files(user :: User.t(), searchterm :: String.t()) ::
          list(Lotta.Storage.File.t())
  def search_files(user, searchterm) do
    matching_searchtext =
      searchterm
      |> String.replace(~r/_|%/, &"\\#{&1}")
      |> then(&"%#{&1}%")

    from(f in Lotta.Storage.File,
      where:
        (f.user_id == ^user.id or is_nil(f.user_id)) and ilike(f.filename, ^matching_searchtext),
      order_by: [:filename]
    )
    |> Repo.all()
  end

  @doc """
  Searches for directories with names matching a given string

  # Examples
    iex> search_directories(user, "house")
    [%Directory{name: "house_utils", ...}, %Directory{name: "my_house_music", ...}]
  """
  @doc since: "5.0.0"
  @spec search_directories(user :: User.t(), searchterm :: String.t()) ::
          list(Lotta.Storage.Directory.t())
  def search_directories(user, searchterm) do
    matching_searchtext =
      searchterm
      |> String.replace(~r/_|%/, &"\\#{&1}")
      |> then(&"%#{&1}%")

    from(d in Directory,
      where: (d.user_id == ^user.id or is_nil(d.user_id)) and ilike(d.name, ^matching_searchtext),
      order_by: [:name]
    )
    |> Repo.all()
  end

  @doc """
  Get the http URL for a given file

  ### TODO
  The download option of `RemoteStorage.get_http_url_options()` does nothing
  as of 3.1.9. It used to add a ?response-content-disposition=attachment query
  parameter, which standard-complient s3 servers would respond with a 400 error.
  See https://github.com/lotta-schule/core/issues/14 for further details.
  I keep it here for now to nudge the memory of the reader, we should bring the
  download functionality back in some way.

  ## Examples
  iex> get_http_url(Repo.get(123))
  "https://somebucket/file.jpg"
  """
  @doc since: "2.5.0"
  @spec get_http_url(
          Lotta.Storage.File.t() | Lotta.Storage.FileConversion.t() | nil,
          RemoteStorage.get_http_url_options()
        ) :: String.t() | nil
  @spec get_http_url(Lotta.Storage.File.t() | Lotta.Storage.FileConversion.t() | nil) ::
          String.t() | nil
  def get_http_url(file, opts \\ [])

  def get_http_url(nil, _opts), do: nil

  def get_http_url(file, opts) do
    entity =
      file
      |> Repo.preload(:remote_storage_entity)
      |> Map.get(:remote_storage_entity)

    if entity do
      entity
      |> RemoteStorage.get_http_url(opts)
      |> ImageProcessingUrl.get_url(opts[:processing])
    end
  end

  @doc """
  Given a list of ids, transfers the corresponding files to a public archive.
  This is the new directory structure created:
  / archive / <current_year> / <user_id> / <filename>.ext
  """
  @doc since: "2.5.0"
  @spec archive_user_files_by_ids([pos_integer()], User.t()) :: [Lotta.Storage.File.t()]
  def archive_user_files_by_ids(file_ids, %User{id: user_id}) do
    from(f in Lotta.Storage.File,
      where: f.user_id == ^user_id and f.id in ^file_ids
    )
    |> Repo.all()
    |> Enum.map(fn file ->
      parent_directory =
        List.last(ensure_archive_directory("#{DateTime.utc_now().year}/#{user_id}"))

      file
      |> Changeset.change(%{user_id: nil, parent_directory_id: parent_directory.id})
      |> Repo.update!()
    end)
  end

  @doc """
  Given a node (file or a directory), return the directories needed to traverse in order
  to reach that node, starting from the first directory node the user has permission to
  access.

  ## Examples

      iex> get_path(%Directory{id: 5, parent: 2 ...}, %User{})
      [%Directory{id: 1, parent: null, ...}, %Directory{id: 2, parent: 1, ...}]

      iex> get_path(%File{id: 6, parent: 2 ...}, %User{})
      [%Directory{id: 1, parent: null, ...}, %Directory{id: 2, parent: 1, ...}]
  """
  @doc since: "5.0.0"
  @spec get_path(Directory.t() | File.t(), User.t()) :: [Directory.t()]
  def get_path(file_or_directory, user), do: get_path(file_or_directory, user, [])

  defp get_path(%{parent_directory_id: nil}, user, current_path), do: current_path

  defp get_path(%{parent_directory_id: id}, user, current_path) do
    case Repo.get(Lotta.Storage.Directory, id) do
      nil ->
        current_path

      %{user_id: user_id} when user_id != user.id and not is_nil(user_id) ->
        current_path

      parent ->
        get_path(parent, user, [parent | current_path])
    end
  end

  @spec ensure_archive_directory(String.t() | nil) :: [Directory.t()]
  defp ensure_archive_directory(path) do
    [
      "archiv"
      | if(is_nil(path), do: [], else: String.split(path, "/"))
    ]
    |> Enum.reduce([], fn dirname, dir_list ->
      parent_directory = List.last(dir_list)

      parent_directory_condition =
        case parent_directory do
          nil ->
            dynamic([d], is_nil(d.parent_directory_id))

          directory ->
            dynamic([d], d.parent_directory_id == ^directory.id)
        end

      condition = dynamic([d], d.name == ^dirname and ^parent_directory_condition)

      from(d in Directory, where: ^condition)
      |> Repo.one()
      |> case do
        nil ->
          {:ok, directory} =
            create_directory(%{
              name: dirname,
              parent_directory_id:
                if(is_nil(parent_directory), do: nil, else: parent_directory.id)
            })

          dir_list ++ [directory]

        directory ->
          dir_list ++ [directory]
      end
    end)
  end

  defp filetype_from("image/" <> _format), do: "image"
  defp filetype_from("audio/" <> _format), do: "audio"
  defp filetype_from("video/" <> _format), do: "video"
  defp filetype_from("application/pdf"), do: "pdf"
  defp filetype_from("x-application/pdf"), do: "pdf"
  defp filetype_from(_), do: "misc"
end
