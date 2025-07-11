defmodule Lotta.Storage.File do
  @moduledoc """
    Ecto Schema for user files
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Lotta.Storage.RemoteStorage
  alias Lotta.Repo
  alias Lotta.Accounts.User
  alias Lotta.Content.ContentModule
  alias Lotta.Storage.{Directory, FileData, FileConversion, RemoteStorageEntity}

  @type id() :: binary()

  @type t() :: %__MODULE__{
          id: id(),
          mime_type: String.t(),
          file_type: String.t(),
          filename: String.t(),
          filesize: pos_integer(),
          metadata: map(),
          page_count: integer() | nil,
          media_duration: float() | nil
        }

  @primary_key {:id, :binary_id, read_after_writes: true}

  @timestamps_opts [type: :utc_datetime]

  schema "files" do
    field(:mime_type, :string)
    field(:file_type, :string)
    field(:filename, :string)
    field(:filesize, :integer)
    field(:metadata, :map)

    field(:page_count, :integer, default: nil)
    field(:media_duration, :float, default: nil)

    has_many(:file_conversions, FileConversion)
    belongs_to(:remote_storage_entity, RemoteStorageEntity, type: :binary_id, on_replace: :nilify)
    belongs_to(:user, User)
    belongs_to(:parent_directory, Directory, type: :binary_id)

    many_to_many(
      :content_modules,
      ContentModule,
      join_through: "content_module_file",
      on_replace: :delete
    )

    timestamps()
  end

  @doc false
  def changeset(file, attrs) do
    file
    |> cast(attrs, [
      :filename,
      :parent_directory_id
    ])
    |> validate_required([
      :filename,
      :filesize,
      :mime_type,
      :file_type,
      :parent_directory_id,
      :user_id
    ])
  end

  @doc """
  Create a file_data struct from a file database entry.
  If the file is locally cached, the cached version will be used.
  If not, the file will be downloaded from the remote storage.
  """
  @spec to_file_data(File.t()) :: {:ok, FileData.t()} | {:error, String.t()}
  def to_file_data(%__MODULE__{} = file) do
    # to_remote_file_data(file)
    if file_data = FileData.get_cached(for: file),
      do: {:ok, file_data},
      else: to_remote_file_data(file)
  end

  defp to_remote_file_data(%__MODULE__{} = file) do
    file = Repo.preload(file, :remote_storage_entity)

    remote_url = RemoteStorage.get_http_url(file.remote_storage_entity)

    with {:ok, env} <-
           Tesla.get(
             remote_url,
             opts: [adapter: [response: :stream]]
           ),
         {:ok, file_data} <-
           FileData.from_stream(
             env.body,
             file.filename,
             mime_type: file.mime_type
           ) do
      FileData.cache(file_data, for: file)
    end
  end
end
