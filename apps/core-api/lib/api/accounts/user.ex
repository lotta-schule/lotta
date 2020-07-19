defmodule Api.Accounts.User do
  @moduledoc """
    Ecto Schema for users
  """

  use Ecto.Schema

  import Ecto.Query
  import Ecto.Changeset

  alias Api.Repo
  alias Ecto.Changeset
  alias Api.Accounts
  alias Api.Accounts.{BlockedTenant, File, User, UserEnrollmentToken, UserGroup}
  alias Api.Content.Article
  alias Api.Tenants.Tenant

  schema "users" do
    field :email, :string
    field :name, :string
    field :nickname, :string
    field :class, :string
    field :last_seen, :naive_datetime
    field :hide_full_name, :boolean
    field :password, :string, virtual: true
    field :password_hash, :string

    belongs_to :tenant, Tenant
    belongs_to :avatar_image_file, File, on_replace: :nilify
    has_many :files, File
    has_many :blocked_tenants, BlockedTenant, on_replace: :delete
    has_many :enrollment_tokens, UserEnrollmentToken, on_replace: :delete

    many_to_many :groups,
                 UserGroup,
                 join_through: "user_user_group",
                 on_replace: :delete

    many_to_many :articles,
                 Article,
                 join_through: "article_users",
                 on_replace: :delete

    timestamps()
  end

  @type email :: String.t()

  @type t :: %User{id: pos_integer(), email: email(), name: String.t()}

  def get_assigned_groups(%User{} = user, %Tenant{} = tenant) do
    user
    |> Repo.preload(:groups)
    |> Map.fetch!(:groups)
    |> Enum.filter(&(&1.tenant_id == tenant.id))
  end

  def get_assigned_groups(%User{} = user) do
    user
    |> Repo.preload(:groups)
    |> Map.fetch!(:groups)
  end

  def get_dynamic_groups(%User{} = user, %Tenant{} = tenant) do
    user =
      user
      |> Repo.preload(:enrollment_tokens)

    tokens =
      user
      |> Map.fetch!(:enrollment_tokens)
      |> Enum.map(& &1.enrollment_token)

    tenant
    |> Accounts.get_groups_by_enrollment_tokens(tokens)
  end

  def get_groups(%User{} = user, %Tenant{} = tenant) do
    get_assigned_groups(user, tenant) ++ get_dynamic_groups(user, tenant)
  end

  def get_groups(%User{} = user) do
    user
    |> get_assigned_groups()
  end

  def group_ids(%User{} = user, %Tenant{} = tenant) do
    user
    |> User.get_groups(tenant)
    |> Enum.map(fn group -> group.id end)
  end

  def group_ids(_, _), do: []

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :class, :email])
    |> unique_constraint(:email, name: :users__lower_email_index)
    |> validate_required([:name, :email])
    |> normalize_email()
  end

  def assign_group_changeset(%User{} = user, %{group: newgroup}) do
    groups =
      Repo.all(from g in UserGroup, where: g.tenant_id != ^newgroup.tenant_id) ++ [newgroup]

    user
    |> Repo.preload(:groups)
    |> Changeset.change()
    |> put_assoc(:groups, groups)
  end

  def update_changeset(%User{} = user, params \\ %{}) do
    user
    |> Repo.preload([:avatar_image_file, :enrollment_tokens])
    |> cast(params, [:name, :class, :nickname, :email, :hide_full_name], [:password])
    |> validate_required([:name, :email])
    |> unique_constraint(:email, name: :users__lower_email_index)
    |> validate_has_nickname_if_hide_full_name_is_set()
    |> put_assoc_avatar_image_file(params)
    |> put_assoc_enrollment_tokens(params)
    |> normalize_email()
  end

  def registration_changeset(%User{} = user, params \\ %{}) do
    user
    |> Repo.preload(:enrollment_tokens)
    |> cast(params, [:name, :class, :nickname, :email, :password, :tenant_id, :hide_full_name])
    |> validate_required([:name, :email, :password])
    |> unique_constraint(:email, name: :users__lower_email_index)
    |> validate_required(:password)
    |> validate_length(:password, min: 6, max: 150)
    |> validate_has_nickname_if_hide_full_name_is_set()
    |> put_assoc_enrollment_tokens(params)
    |> normalize_email()
    |> put_pass_hash()
  end

  def update_password_changeset(%User{} = user, password)
      when is_binary(password) and byte_size(password) > 0 do
    user
    |> Repo.preload(:enrollment_tokens)
    |> Changeset.change(%{password: password})
    |> validate_required(:password)
    |> validate_length(:password, min: 6, max: 150)
    |> put_pass_hash()
  end

  defp put_pass_hash(changeset) do
    case changeset do
      %Changeset{valid?: true, changes: %{password: password}} ->
        put_change(changeset, :password_hash, Bcrypt.hash_pwd_salt(password))

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
    user
    |> put_assoc(:avatar_image_file, nil)
  end

  defp put_assoc_avatar_image_file(user, _args), do: user

  defp put_assoc_enrollment_tokens(user, %{enrollment_tokens: enrollment_tokens}) do
    user
    |> put_assoc(:enrollment_tokens, Enum.map(enrollment_tokens, &%{enrollment_token: &1}))
  end

  defp put_assoc_enrollment_tokens(user, _args), do: user

  defp validate_has_nickname_if_hide_full_name_is_set(%Changeset{} = changeset) do
    case fetch_field(changeset, :hide_full_name) do
      {_, true} ->
        validate_required(changeset, :nickname)

      _ ->
        changeset
    end
  end

  @doc """
  Generates a changeset which sets the user's groups.
  Replaces all other group's of the given tenant.
  """
  @spec set_users_tenant_groups_changeset(%User{}, %Tenant{}, [%UserGroup{}]) :: %Changeset{}
  def set_users_tenant_groups_changeset(user, tenant, groups) do
    user = Repo.preload(user, :groups)

    groups =
      user.groups
      |> Enum.filter(fn g -> g.tenant_id !== tenant.id end)
      |> Enum.concat(groups)

    user
    |> Changeset.change()
    |> Changeset.put_assoc(:groups, groups)
  end
end
