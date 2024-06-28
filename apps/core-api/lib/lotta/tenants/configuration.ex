defmodule Lotta.Tenants.Configuration do
  @moduledoc """
    Ecto Schema for tenant's configuration
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Lotta.Storage.File

  @type t :: %__MODULE__{name: String.t()}

  @type value :: File.t() | String.t() | map()

  @primary_key false

  @timestamps_opts [type: :utc_datetime]

  schema "configuration" do
    field :name, :string
    field :string_value, :string
    field :json_value, :map

    belongs_to :file_value, File, type: :binary_id

    timestamps()
  end

  @spec possible_keys() :: [String.t()]
  def possible_keys() do
    [
      "custom_theme",
      "logo_image_file",
      "background_image_file",
      "user_max_storage_config"
    ]
  end

  @spec changeset(map()) :: Ecto.Changeset.t(t())
  def changeset(args) do
    %__MODULE__{}
    |> cast(args, [:name, :string_value, :json_value, :file_value_id])
    |> validate_required(:name)
    |> validate_change(
      :name,
      fn :name, name ->
        if Enum.member?(possible_keys(), name) do
          []
        else
          [name: "Must be one of #{Enum.join(possible_keys(), ",")}"]
        end
      end
    )
    |> unique_constraint(:name)
  end
end
