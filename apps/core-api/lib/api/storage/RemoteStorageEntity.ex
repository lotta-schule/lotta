defmodule Api.Storage.RemoteStorageEntity do
  @moduledoc """
    Ecto Schema for remotely saved files
  """
  use Ecto.Schema

  alias Api.Storage.File

  schema "remote_storage_entities" do
    field :store_name, :string
    field :path, :string

    has_one :file, File

    timestamps()
  end
end
