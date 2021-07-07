defmodule Lotta.Storage.Directory do
  @moduledoc """
    Ecto Schema for user file directories
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Storage.File

  @primary_key {:id, :binary_id, read_after_writes: true}

  @timestamps_opts [type: :utc_datetime]

  schema "directories" do
    field :name, :string

    belongs_to :user, User
    belongs_to :parent_directory, __MODULE__, type: :binary_id
    belongs_to :group, UserGroup

    has_many :directories, __MODULE__, foreign_key: :parent_directory_id

    has_many :files, File, foreign_key: :parent_directory_id

    timestamps()
  end

  @type t :: %__MODULE__{id: pos_integer(), name: String.t()}

  @doc false
  def changeset(%__MODULE__{} = directory, attrs) do
    directory
    |> cast(attrs, [:name, :user_id, :parent_directory_id])
    |> validate_required([:name])
    |> unique_constraint(:name,
      name: :directories_name_parent_directory_id_user_id_index
    )
  end
end
