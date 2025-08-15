defmodule Lotta.Accounts.User do
  @moduledoc """
    Ecto Schema for users
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Lotta.Repo
  alias Ecto.Changeset
  alias Lotta.Accounts.{UserGroup, UserDevice}
  alias Lotta.Storage.{Directory, File}
  alias Lotta.Content.Article

  @timestamps_opts [type: :utc_datetime]

  schema "users" do
    field(:email, :string)
    field(:eduplaces_id, :string)

    field(:name, :string)
    field(:nickname, :string)
    field(:class, :string)
    field(:last_seen, :utc_datetime)
    field(:hide_full_name, :boolean)
    field(:password, :string, virtual: true)
    field(:password_hash, :string)
    field(:password_hash_format, :integer)
    field(:has_changed_default_password, :boolean)

    field(:all_groups, {:array, :any}, virtual: true, default: [])
    field(:is_admin?, :boolean, virtual: true, default: false)
    field(:access_level, :string, virtual: true)

    field(:enrollment_tokens, {:array, :string}, default: [])

    belongs_to(:avatar_image_file, File,
      on_replace: :nilify,
      type: :binary_id
    )

    has_many(:files, File)
    has_many(:directories, Directory)
    has_many(:devices, UserDevice)
    has_many(:sent_messages, Lotta.Messages.Message)

    many_to_many(
      :groups,
      UserGroup,
      join_through: "user_user_group",
      on_replace: :delete
    )

    many_to_many(
      :articles,
      Article,
      join_through: "article_users",
      on_replace: :delete
    )

    timestamps()
  end

  @type id :: pos_integer()

  @type email :: String.t()

  @type t :: %__MODULE__{id: id, email: email(), name: String.t()}

  @type empty ::
          %__MODULE__{
            name: String.t(),
            email: email()
          }
          | %__MODULE__{
              name: String.t(),
              eduplaces_id: String.t()
            }

  @doc """
  Returns a changeset for when the admin wants to update *another user*'s changeset.
  """
  @doc since: "1.0.0"

  @spec update_changeset(t(), map()) :: Changeset.t()
  def update_changeset(%__MODULE__{} = user, params \\ %{}) do
    user
    |> Repo.preload(:groups)
    |> Changeset.change()
    |> put_assoc_groups(params)
  end

  @doc """
  Returns a changeset for when the user wants to update *his own* changeset.
  Updating the password is not part of this changeset. The password has to be
  updated separatly (see `Lotta.Accounts.User.update_password_changeset/2`)
  """
  @doc since: "1.0.0"

  @spec update_profile_changeset(t(), map()) :: Changeset.t()
  def update_profile_changeset(%__MODULE__{} = user, params \\ %{}) do
    user
    |> Repo.preload([:avatar_image_file])
    |> cast(params, [:name, :class, :nickname, :hide_full_name, :enrollment_tokens])
    |> normalize_email()
    |> validate_required([:name, :email])
    |> unique_constraint(:email, name: :users__lower_email_index)
    |> validate_length(:email, min: 4, max: 100)
    |> validate_has_nickname_if_hide_full_name_is_set()
    |> put_assoc_avatar_image_file(params)
  end

  @doc """
  Returns a changeset for when the user wants to register.
  """
  @doc since: "1.0.0"

  @spec registration_changeset(t(), map()) :: Changeset.t()

  def registration_changeset(%__MODULE__{} = user, params \\ %{}) do
    user
    |> cast(params, [
      :name,
      :class,
      :nickname,
      :email,
      :password,
      :hide_full_name,
      :enrollment_tokens
    ])
    |> normalize_email()
    |> validate_required([:name])
    |> check_constraint(:email,
      name: :at_least_one_of_eduplaces_id_or_email,
      message: "Email is missing"
    )
    |> validate_length(:email, min: 4, max: 100)
    |> unique_constraint(:email, name: :users__lower_email_index)
    |> check_constraint(:email,
      name: :passwort_required_when_email_is_set,
      message: "Password is required"
    )
    |> validate_length(:password, min: 6, max: 150)
    |> validate_has_nickname_if_hide_full_name_is_set()
    |> put_pass_hash()
  end

  @doc """
  Returns a changeset for when the user wants to update *his own password*.
  """
  @doc since: "1.0.0"

  @spec update_password_changeset(t(), String.t()) :: Changeset.t()

  def update_password_changeset(%__MODULE__{} = user, password)
      when is_binary(password) and byte_size(password) > 0 do
    user
    |> Changeset.change(%{password: password})
    |> validate_required(:password)
    |> validate_length(:password, min: 6, max: 150)
    |> put_pass_hash()
    |> put_change(:has_changed_default_password, true)
  end

  @doc """
  Returns a changeset for when the user wants to update *his own email*.
  """
  @doc since: "2.4.0"

  @spec update_email_changeset(t(), String.t()) :: Changeset.t()

  def update_email_changeset(%__MODULE__{} = user, email)
      when is_binary(email) and byte_size(email) > 0 do
    user
    |> Changeset.change(%{email: email})
    |> normalize_email()
    |> validate_required(:email)
    |> validate_length(:email, min: 4, max: 100)
    |> unique_constraint(:email, name: :users__lower_email_index)
  end

  defp put_pass_hash(changeset) do
    case changeset do
      %Changeset{valid?: true, changes: %{password: password}} ->
        changeset
        |> put_change(:password_hash, Argon2.hash_pwd_salt(password))
        |> put_change(:password_hash_format, 1)

      _ ->
        changeset
    end
  end

  defp normalize_email(changeset) do
    case changeset do
      %Changeset{valid?: true, changes: %{email: email}} when is_binary(email) ->
        put_change(changeset, :email, String.trim(email))

      _ ->
        changeset
    end
  end

  defp put_assoc_avatar_image_file(user, %{avatar_image_file: %{id: avatar_image_file_id}}) do
    user
    |> put_assoc(:avatar_image_file, Repo.get(File, avatar_image_file_id))
  end

  defp put_assoc_avatar_image_file(user, %{avatar_image_file: nil}) do
    put_assoc(user, :avatar_image_file, nil)
  end

  defp put_assoc_avatar_image_file(user, _args), do: user

  defp put_assoc_groups(%Ecto.Changeset{data: user} = changeset, %{groups: groups}) do
    groups =
      groups
      |> Enum.map(fn group ->
        case group do
          %UserGroup{} ->
            group

          %{id: id} ->
            UserGroup
            |> Repo.get(String.to_integer(id), prefix: Ecto.get_meta(user, :prefix))
        end
      end)
      |> Enum.filter(&(!is_nil(&1)))

    put_assoc(changeset, :groups, groups)
  end

  defp put_assoc_groups(user, _args), do: user

  defp validate_has_nickname_if_hide_full_name_is_set(%Changeset{} = changeset) do
    case fetch_field(changeset, :hide_full_name) do
      {_, true} ->
        validate_required(changeset, :nickname)

      _ ->
        changeset
    end
  end
end
