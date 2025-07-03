defmodule Lotta.Storage.FileConversion do
  @moduledoc """
    Ecto Schema for file conversions
  """

  use Ecto.Schema

  # import Ecto.Changeset

  alias Lotta.Storage.{File, RemoteStorageEntity}

  @type t :: %__MODULE__{
          id: binary(),
          file_type: String.t(),
          filesize: integer(),
          format: String.t(),
          mime_type: String.t(),
          full_metadata: map(),
          metadata: map(),
          media_duration: float(),
          file: File.t(),
          remote_storage_entity: RemoteStorageEntity.t(),
          inserted_at: NaiveDateTime.t(),
          updated_at: NaiveDateTime.t()
        }

  @primary_key {:id, :binary_id, read_after_writes: true}

  @timestamps_opts [type: :utc_datetime]

  schema "file_conversions" do
    field(:file_type, :string)
    field(:filesize, :integer)
    field(:format, :string)
    field(:mime_type, :string)
    field(:full_metadata, :map)
    field(:metadata, :map)
    field(:media_duration, :float)

    belongs_to :file, File, type: :binary_id
    belongs_to :remote_storage_entity, RemoteStorageEntity, type: :binary_id, on_replace: :nilify

    timestamps()
  end

  # @doc false
  # def changeset(file_conversion, attrs) do
  #   file_conversion
  #   |> cast(attrs, [:format, :mime_type, :file_type, :file_id])
  #   |> validate_required([:format, :mime_type, :file_type, :file_id])
  # end
end
