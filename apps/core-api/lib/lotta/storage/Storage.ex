defmodule Lotta.Storage do
  require Logger

  import Ecto.Query

  alias Plug.Upload
  alias Ecto.Multi
  alias Ecto.Changeset
  alias Lotta.Repo
  alias Lotta.Accounts.User
  alias Lotta.Storage.{Directory, RemoteStorage}

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
        Lotta.Queue.MediaConversionRequestPublisher.send_conversion_request(file)
        {:ok, file}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Change the Remote storage of the file, that means, move file data to another location.
  """
  @doc since: "2.5.0"
  @spec set_remote_storage(Api.Storage.File.t() | Api.Storage.FileConversion.t(), String.t()) ::
          {:ok, Api.Storage.File.t()} | {:error, Changeset.t()} | {:error, atom()}
  def set_remote_storage(file, store_name) when is_binary(store_name) do
    file =
      file
      |> Repo.preload(:remote_storage_entity)

    filepath = Path.join(System.tmp_dir(), file.id)
    # first fetch the file data
    file_url =
      file.remote_storage_entity
      |> RemoteStorage.get_http_url()
      |> String.to_charlist()

    with {:ok, :saved_to_file} <-
           :httpc.request(:get, {file_url, []}, [], stream: String.to_charlist(filepath)),
         {:ok, entity} <-
           RemoteStorage.create(
             %Upload{
               filename:
                 case file do
                   %{filename: filename} ->
                     filename

                   _ ->
                     ""
                 end,
               content_type: file.mime_type,
               path: filepath
             },
             case file do
               %{file_id: fileid, id: id} ->
                 Path.join(fileid, id)

               file ->
                 file.id
             end
           ) do
      file
      |> Repo.build_prefixed_assoc(:remote_storage_entity, entity)
      |> Repo.insert()

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
  Get the http URL for a given file

  ## Examples
  iex> get_http_url(Repo.get(123))
  "https://somebucket/file.jpg"
  """
  @doc since: "2.5.0"
  @spec get_http_url(Lotta.Storage.File.t() | Lotta.Storage.FileConversion.t() | nil) ::
          String.t() | nil
  def get_http_url(nil), do: nil

  def get_http_url(file) do
    entity =
      file
      |> Repo.preload(:remote_storage_entity)
      |> Map.get(:remote_storage_entity)

    if entity, do: RemoteStorage.get_http_url(entity)
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
