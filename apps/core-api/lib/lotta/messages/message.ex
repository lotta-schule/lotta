defmodule Lotta.Messages.Message do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset
  alias Lotta.Storage
  alias Lotta.Storage.File
  alias Lotta.Accounts.User
  alias Lotta.Messages.Conversation

  @timestamps_opts [type: :utc_datetime]

  schema "messages" do
    field :content, :string

    belongs_to :user, User
    belongs_to :conversation, Conversation, type: :binary_id, on_replace: :delete
    many_to_many :files,
      File,
      join_through: "message_file",
      on_replace: :delete

    timestamps()
  end

  @type id :: pos_integer()

  @type t :: %__MODULE__{id: id, content: String.t()}

  @doc false
  @spec changeset(t(), map()) :: Ecto.Changeset.t(t())
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:content, :user_id])
    |> put_assoc_attachments(attrs)
    |> validate_required_either_content_or_files()
  end

  @spec validate_required_either_content_or_files(Ecto.Changeset.t(t())) :: Ecto.Changeset.t(t())
  defp validate_required_either_content_or_files(changeset) do
    case get_field(changeset, :files) do
      files when is_nil(files) or length(files) < 1 ->
        validate_required(changeset, :content)
      _ ->
      changeset
    end
  end

  @spec put_assoc_attachments(Ecto.Changeset.t(t()), struct()) :: Ecto.Changeset.t(t())
  defp put_assoc_attachments(message, attrs) do
    files =
      (attrs.files || [])
      |> Enum.map(&(Storage.get_file(&1.id)))
      |> Enum.filter(&(not is_nil(&1)))

    message
    |> put_assoc(:files, files)
  end

end

