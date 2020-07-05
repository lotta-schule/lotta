defmodule Api.Accounts.FileConversion do
  @moduledoc """
    Ecto Schema for file conversions
  """

  use Ecto.Schema
  import Ecto.Changeset

  schema "file_conversions" do
    field :file_type, :string
    field :filesize, :integer
    field :format, :string
    field :mime_type, :string
    field :remote_location, :string

    belongs_to :file, Api.Accounts.File

    timestamps()
  end

  @doc false
  def changeset(file_conversion, attrs) do
    file_conversion
    |> cast(attrs, [:format, :remote_location, :mime_type, :file_type, :file_id])
    |> validate_required([:format, :remote_location, :mime_type, :file_type, :file_id])
  end
end
