defmodule Lotta.Storage do
  @moduledoc """
  Handles storage for files uploaded by the user.
  """
  require Logger

  import Ecto.Query

  alias Ecto.Changeset
  alias Lotta.{MetadataWorker, Repo, Tenants, ConversionWorker}
  alias Lotta.Accounts.{FileManagment, User}
  alias Lotta.Storage.Conversion.AvailableFormats

  alias Lotta.Storage.{
    Directory,
    File,
    FileConversion,
    FileData,
    RemoteStorage,
    RemoteStorageEntity
  }

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2)
  end

  def query(queryable, _params) do
    queryable
  end

  @doc """
  Upload a file to a given directory for a given user.
  Creates the `Lotta.Storage.File` object in the database and stores the data in the
  default RemoteStorage.
  If metadata can be extracted from the file, it will be stored in the `metadata` field.
  If there are conversions to be made immediately, they will be triggered.
  """
  @doc since: "5.0.0"
  @spec create_file(FileData.t(), Directory.t(), User.t()) ::
          {:ok, File.t()} | {:error, term()}
  def create_file(
        %FileData{} = file_data,
        %Directory{} = directory,
        %User{} = user
      ) do
    with {:ok, file} <-
           directory
           |> Repo.build_prefixed_assoc(:files, %{
             user_id: user.id,
             filename: Keyword.get(file_data.metadata, :filename),
             filesize: Keyword.get(file_data.metadata, :size),
             file_type: Keyword.get(file_data.metadata, :type),
             mime_type: Keyword.get(file_data.metadata, :mime_type)
           })
           |> Repo.insert(),
         {:ok, file} <-
           upload_filedata_for_file_or_conversion(file_data, file) do
      FileData.cache(file_data, for: file)

      await_metadata_task =
        case MetadataWorker.create_metadata_job(file) do
          {:ok, metadata_job} -> MetadataWorker.await_completion_task(metadata_job)
          {:error, _} -> nil
        end

      file
      |> AvailableFormats.get_immediate_formats()
      # A good place for a metadata job
      |> Enum.map(&ConversionWorker.get_or_create_conversion_job(file, &1))
      |> Enum.filter(&(elem(&1, 0) == :ok))
      |> Enum.map(&ConversionWorker.await_completion_task(elem(&1, 1)))
      # they their own timeout
      |> then(fn await_conversion_tasks ->
        if await_metadata_task do
          [await_metadata_task | await_conversion_tasks]
        else
          await_conversion_tasks
        end
        |> Task.await_many(:timer.minutes(1))
      end)

      {:ok, Repo.reload(file)}
    else
      error ->
        Logger.error("Error creating file: #{inspect(error)}")
        FileData.clear(file_data)

        error
    end
  end

  @doc """
  Upload a variant of a file (e.g. a thumbnail) that is locally available.
  Creates the  `Lotta.Storage.FileConversion` object (assigned to the file)
  in the database and stores the data in the default RemoteStorage.
  """
  @doc since: "5.1.0"
  @spec create_file_conversion(FileData.t(), File.t(), variant_name :: String.t()) ::
          {:ok, FileConversion.t()} | {:error, term()}
  def create_file_conversion(
        %FileData{} = file_data,
        %File{} = file,
        variant_name
      ) do
    with {:ok, file_conversion} <-
           file
           |> Repo.preload(:file_conversions)
           |> Repo.build_prefixed_assoc(:file_conversions, %{
             format: variant_name,
             filesize: Keyword.get(file_data.metadata, :size),
             mime_type: Keyword.get(file_data.metadata, :mime_type),
             file_type: filetype_from(Keyword.get(file_data.metadata, :mime_type))
           })
           |> Repo.insert() do
      upload_filedata_for_file_or_conversion(file_data, file_conversion)
    end
  end

  @spec upload_filedata_for_file_or_conversion(FileData.t(), File.t() | FileConversion.t()) ::
          {:ok, File.t() | FileConversion.t()} | {:error, term()}
  defp upload_filedata_for_file_or_conversion(%FileData{} = file_data, foc)
       when is_struct(foc, File) or is_struct(foc, FileConversion) do
    prefix = Ecto.get_meta(foc, :prefix)

    file_id =
      case foc do
        %File{id: id} -> id
        %FileConversion{file_id: id} -> id
      end

    variant_name =
      case foc do
        %FileConversion{format: format} -> format
        _ -> "original"
      end

    case RemoteStorage.create(file_data, "#{prefix}/#{file_id}/#{variant_name}") do
      {:ok, entity_data} ->
        foc
        |> Repo.preload(:remote_storage_entity)
        |> Ecto.Changeset.change()
        |> Ecto.Changeset.put_assoc(
          :remote_storage_entity,
          entity_data
        )
        |> Repo.update()

      error ->
        Logger.error("Error uploading file data: #{inspect(error)}")

        RemoteStorage.delete("#{prefix}/#{file_id}/#{variant_name}")

        Repo.delete(foc, prefix: prefix)
        error
    end
  end

  @doc """
  Change the Remote storage of the file, that means, move file data to another location,
  and create a new RemoteStorage entity for the file.
  The old RemoteStorage entity will be kept, as the file itself is not changed.
  """
  @doc since: "2.5.0"
  @spec copy_to_remote_storage(File.t() | FileConversion.t(), String.t()) ::
          {:ok, File.t()} | {:error, Changeset.t()} | {:error, atom()}
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
         {:ok, file_data} <-
           FileData.from_path(filepath, filename: file.filename, mime_type: file.mime_type),
         {:ok, entity} <-
           RemoteStorage.create(
             file_data,
             "#{Ecto.get_meta(file, :prefix)}/" <>
               case file_or_file_conversion do
                 %{file_id: fileid, id: id} ->
                   Path.join(fileid <> "-conversion", id)

                 %{id: id} ->
                   id
               end
           ) do
      Elixir.File.rm(filepath)

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
          from(f in File,
            where: parent_as(:remote_storage_entity).id == f.remote_storage_entity_id
          )
        ) and
          not exists(
            from(fc in FileConversion,
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
    from(f in File,
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
  @spec get_file(File.id(), opts :: keyword() | nil) :: File.t() | nil
  def get_file(id, opts \\ []), do: Repo.get(File, id, opts)

  @doc """
  Gets a `Lotta.Storage.FilgeConversion` with a given name from a given file.

  ## Examples

      iex> get_file_conversion(%File{id: 123}, "preview_200")
      {:ok, %FileConversion{}}

      iex> get_file_conversion(%File{id: 123}, "doesnotexist")
      {:error, "FileConversion not found"}

  """
  @doc since: "5.0.0"
  @spec get_file_conversion(File.t(), atom() | String.t()) ::
          {:ok, FileConversion.t()} | {:error, String.t()}
  def get_file_conversion(%File{id: file_id} = file, format) do
    with nil <-
           Repo.get_by(FileConversion, file_id: file_id, format: format),
         {:ok, job} <-
           ConversionWorker.get_or_create_conversion_job(file, format),
         {:ok, _} <- Task.await(ConversionWorker.await_completion(job)),
         file_conversion when not is_nil(file_conversion) <-
           Repo.get_by(FileConversion, file_id: file_id, format: format) do
      {:ok, file_conversion}
    else
      %FileConversion{} = file_conversion ->
        {:ok, file_conversion}

      nil ->
        {:error, "FileConversion not found"}

      error ->
        error
    end
  catch
    :error, reason ->
      Logger.error("Failed to get file conversion: #{inspect(reason)}")
      {:error, "An unexpected error occurred"}
  end

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
  @spec get_file_conversion(FileConversion.id()) ::
          FileConversion.t() | nil
  def get_file_conversion(id), do: Repo.get(FileConversion, id)

  @doc """
  Updates a file.

  ## Examples

      iex> update_file(file, path)
      {:ok, %File{}}

  """
  @doc since: "2.5.0"
  def update_file(%File{} = file, attrs) do
    file
    |> File.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a File AND all its dependend conversions

  If the file is referenced by its tenant's logo_image_file_id or background_image_file_id,
  the corresponding field will be set to nil.

  ## Examples

      iex> delete_file(file)
      {:ok, %File{}}

      iex> delete_file(file)
      {:error, %Ecto.Changeset{}}

  """
  @doc since: "2.5.0"
  @spec delete_file(File.t()) ::
          {:ok, File.t()} | {:error, Ecto.Changeset.t()}
  def delete_file(%File{} = file) do
    file =
      file
      |> Repo.preload([:file_conversions, :remote_storage_entity])

    file.file_conversions
    |> Repo.preload(:remote_storage_entity)
    |> Enum.each(fn file_conversion ->
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

    tenant = Tenants.get_tenant_by_prefix(Ecto.get_meta(file, :prefix))

    if tenant.logo_image_file_id == file.id do
      Tenants.update_tenant(tenant, %{logo_image_file_id: nil})
    end

    if tenant.background_image_file_id == file.id do
      Tenants.update_tenant(tenant, %{background_image_file_id: nil})
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
          list(File.t())
  def search_files(user, searchterm) do
    matching_searchtext =
      searchterm
      |> String.replace(~r/_|%/, &"\\#{&1}")
      |> then(&"%#{&1}%")

    from(f in File,
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
          File.t() | FileConversion.t() | nil,
          RemoteStorage.get_http_url_options()
        ) :: String.t() | nil
  @spec get_http_url(File.t() | FileConversion.t() | nil) ::
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
    end
  end

  @doc """
  Given a list of ids, transfers the corresponding files to a public archive.
  This is the new directory structure created:
  / archive / <current_year> / <user_id> / <filename>.ext
  """
  @doc since: "2.5.0"
  @spec archive_user_files_by_ids([pos_integer()], User.t()) :: [File.t()]
  def archive_user_files_by_ids(file_ids, %User{id: user_id}) do
    from(f in File,
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

  @doc """
  Checks if a directory has a minimum of `required_space` bytes available.
  Returns `:ok` if the directory has enough space, otherwise `{:error, :not_enough_space}`.
  """
  @doc since: "5.1.0"
  @spec check_directory_space(Directory.t(), required_space :: pos_integer()) ::
          :ok | {:error, :not_enough_space}
  def check_directory_space(%Directory{user_id: nil}, _), do: :ok

  def check_directory_space(%Directory{user_id: user_id} = directory, required_space) do
    tenant = Tenants.get_tenant_by_prefix(Ecto.get_meta(directory, :prefix))
    user = Repo.get(User, user_id)

    if is_nil(tenant) do
      raise "Tenant not found for directory #{directory.id}"
    end

    size_limit =
      tenant.configuration
      |> Map.get(:user_max_storage_config)
      |> then(&String.to_integer(&1 || "-1"))

    free_space = if size_limit == -1, do: -1, else: size_limit

    case size_limit - FileManagment.total_user_files_size(user) do
      _ when free_space == -1 ->
        :ok

      free_space when free_space >= required_space ->
        :ok

      _ ->
        {:error, :not_enough_space}
    end
  end

  defp get_path(%{parent_directory_id: nil}, _user, current_path), do: current_path

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

  def filetype_from("image/" <> _format), do: "image"
  def filetype_from("application/svg"), do: "image"
  def filetype_from("audio/" <> _format), do: "audio"
  def filetype_from("video/" <> _format), do: "video"

  def filetype_from(format) do
    if String.ends_with?(format, "/pdf") do
      "pdf"
    else
      "binary"
    end
  end
end
