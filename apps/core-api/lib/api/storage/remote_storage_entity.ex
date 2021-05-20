defmodule Api.Storage.RemoteStorageEntity do
  @moduledoc """
    Ecto Schema for remotely saved files
  """
  use Ecto.Schema

  alias Api.Storage.File

  @primary_key {:id, :binary_id, read_after_writes: true}

  @timestamps_opts [type: :utc_datetime]

  schema "remote_storage_entities" do
    field :store_name, :string
    field :path, :string

    has_one :file, File
    has_one :file_conversion, FileConversion

    timestamps()
  end
end
