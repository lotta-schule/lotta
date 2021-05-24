defmodule Api.Storage.File do
  @moduledoc """
    Ecto Schema for user files
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Api.Accounts.User
  alias Api.Content.ContentModule
  alias Api.Storage.{Directory, FileConversion, RemoteStorageEntity}

  @primary_key {:id, :binary_id, read_after_writes: true}

  @timestamps_opts [type: :utc_datetime]

  schema "files" do
    field :mime_type, :string
    field :file_type, :string
    field :filename, :string
    field :filesize, :integer
    field :full_metadata, :map
    field :metadata, :map
    field :media_duration, :float

    has_many :file_conversions, FileConversion
    belongs_to :remote_storage_entity, RemoteStorageEntity, type: :binary_id, on_replace: :nilfiy
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
end
