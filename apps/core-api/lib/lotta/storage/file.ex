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
          filename: String.t(),
          filesize: pos_integer(),
          full_metadata: map(),
          metadata: map(),
          media_duration: float()
        }

  @primary_key {:id, :binary_id, read_after_writes: true}

  @timestamps_opts [type: :utc_datetime]

  schema "files" do
    field(:mime_type, :string)
    field(:file_type, :string)
    field(:filename, :string)
    field(:filesize, :integer)
    field(:full_metadata, :map)
    field(:metadata, :map)
    field(:media_duration, :float)

    has_many :file_conversions, FileConversion
    belongs_to :remote_storage_entity, RemoteStorageEntity, type: :binary_id, on_replace: :nilify
    belongs_to :user, User
    belongs_to :parent_directory, Directory, type: :binary_id

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

  def to_file_data(
        %__MODULE__{filename: filename, filesize: filesize, mime_type: mime_type} = file
      ) do
    file = Repo.preload(file, :remote_storage_entity)
    url = RemoteStorage.get_http_url(file.remote_storage_entity)

    Tesla.get(
      Tesla.client([{Tesla.Middleware.SSE, only: :data}]),
      url,
      opts: [adapter: [response: :stream]]
    )
    |> dbg()
    |> case do
      {:ok, %{body: body}} when is_binary(body) ->
        FileData.from_data(body, filename, mime_type: mime_type)

      {:ok, %{body: body}} ->
        {:ok,
         %FileData{
           stream: body,
           metadata: %{
             filename: filename,
             filesize: filesize,
             mime_type: mime_type
           }
         }}

      {:error, _reason} ->
        {:error, "Failed to download file"}
    end
  end
end
