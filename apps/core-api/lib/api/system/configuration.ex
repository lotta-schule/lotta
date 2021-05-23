defmodule Api.System.Configuration do
  @moduledoc """
    Ecto Schema for system configuration
  """

  alias Api.Storage.File

  use Ecto.Schema

  @primary_key false

  @timestamps_opts [type: :utc_datetime]

  schema "configuration" do
    field :name, :string
    field :string_value, :string
    field :json_value, :map

    belongs_to :file_value, File, type: :binary_id

    timestamps()
  end

  @type t :: %__MODULE__{name: String.t()}

  @type value :: File.t() | String.t() | map()
end
