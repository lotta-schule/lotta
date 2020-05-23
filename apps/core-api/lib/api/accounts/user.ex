defmodule Api.Accounts.User do
  use Ecto.Schema
  alias Api.Repo
  import Ecto.Changeset
  import Ecto.Query
  alias Api.Accounts.{Directory,File,User,UserGroup}
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

    belongs_to :tenant, Api.Tenants.Tenant
    belongs_to :avatar_image_file, Api.Accounts.File,
      on_replace: :nilify
    has_many :files, Api.Accounts.File
    has_many :blocked_tenants, Api.Accounts.BlockedTenant,
      on_replace: :delete
    has_many :enrollment_tokens, Api.Accounts.UserEnrollmentToken,
      on_replace: :delete
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

  def is_lotta_admin?(%User{} = user) do
    [
      "alexis.rinaldoni@einsa.net",
      "eike.wiewiorra@einsa.net",
      "billy@einsa.net"
    ]
    |> Enum.any?(fn email ->
      user.email == email
    end)
  end

  def is_admin?(%User{} = user, %Tenant{} = tenant) do
    is_lotta_admin?(user) || user
    |> get_groups(tenant)
    |> Enum.any?(fn group -> group.tenant_id == tenant.id && group.is_admin_group end)
  end
  def is_admin?(_, _), do: false

  def is_author?(%User{} = user, %Article{} = article) do
    article
    |> Repo.preload(:users)
    |> Map.get(:users)
    |> Enum.any?(fn u -> u.id == user.id end)
  end
  def is_author?(%User{id: userId}, %Directory{} = directory) do
    case Repo.preload(directory, :user) do
      %{user: %{id: id}} -> id == userId
      _ -> false
    end
  end
  def is_author?(%User{id: userId}, %File{} = file) do
    case Repo.preload(file, :user) do
      %{user: %{id: id}} -> id == userId
      _ -> false
    end
  end
  def is_author?(_, _), do: false

  def can_write_directory?(%User{} = user, %Directory{} = directory) do
    directory = Repo.preload(directory, [:tenant, :user])
    User.is_author?(user, directory) || if User.is_admin?(user, directory.tenant) do
      is_nil(directory.user)
    else
      false
    end
  end
  def can_write_directory?(_, _), do: false

  def can_read_directory?(%User{} = user, %Directory{} = directory) do
    directory = Repo.preload(directory, [:user])
    User.is_author?(user, directory) || is_nil(directory.user)
  end
  def can_read_directory?(_, _), do: false

  def has_group_for_article?(%User{} = user, %Article{} = article) do
    user_group_ids = User.group_ids(user, Repo.preload(article, :tenant).tenant)
    article_group_ids =
      article
      |> Repo.preload([:groups, :tenant])
      |> Map.fetch!(:groups)
      |> Enum.map(fn group -> group.id end)

    Enum.empty?(article_group_ids) || Enum.any?(article_group_ids, &Enum.member?(user_group_ids, &1))
  end

  def is_blocked?(%User{} = user, %Tenant{} = tenant) do
    user
      |> Repo.preload(:blocked_tenants)
      |> Map.fetch!(:blocked_tenants)
      |> Enum.any?(fn blocked_tenant -> blocked_tenant.tenant_id == tenant.id end)
  end

  def get_assigned_groups(%User{} = user) do
    user
    |> Repo.preload(:groups)
    |> Map.fetch!(:groups)
  end

  def get_dynamic_groups(%User{} = user, %Tenant{} = tenant) do
    user = user
    |> Repo.preload(:enrollment_tokens)
    tokens =
      user
      |> Map.fetch!(:enrollment_tokens)
      |> Enum.map(&(&1.enrollment_token))
    tenant
    |> Api.Accounts.get_groups_by_enrollment_tokens(tokens)
  end

  def get_groups(%User{} = user, %Tenant{} = tenant) do
    get_assigned_groups(user) ++ get_dynamic_groups(user, tenant)
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
    |> unique_constraint(:email)
    |> validate_required([:name, :email])
  end

  def assign_group_changeset(%User{} = user, %{group: newgroup}) do
    groups = Repo.all(from g in UserGroup, where: g.tenant_id != ^newgroup.tenant_id) ++ [newgroup]
    user
    |> Repo.preload(:groups)
    |> Ecto.Changeset.change()
    |> put_assoc(:groups, groups)
  end

  def update_changeset(%User{} = user, params \\ %{}) do
    user
    |> Repo.preload([:avatar_image_file, :enrollment_tokens])
    |> cast(params, [:name, :class, :nickname, :email, :hide_full_name], [:password])
    |> validate_required([:name, :email])
    |> unique_constraint(:email)
    |> validate_has_nickname_if_hide_full_name_is_set()
    |> put_assoc_avatar_image_file(params)
    |> put_assoc_enrollment_tokens(params)
  end

  def registration_changeset(%User{} = user, params \\ %{}) do
    user
    |> Repo.preload(:enrollment_tokens)
    |> cast(params, [:name, :class, :nickname, :email, :password, :tenant_id, :hide_full_name])
    |> validate_required([:name, :email, :password, :tenant_id])
    |> unique_constraint(:email)
    |> validate_required(:password)
    |> validate_length(:password, min: 6, max: 150)
    |> validate_has_nickname_if_hide_full_name_is_set()
    |> put_pass_hash()
    |> put_assoc_enrollment_tokens(params)
  end

  def update_password_changeset(%User{} = user, password) when is_binary(password) and byte_size(password) > 0 do
    user
    |> Repo.preload(:enrollment_tokens)
    |> Ecto.Changeset.change(%{password: password})
    |> validate_required(:password)
    |> validate_length(:password, min: 6, max: 150)
    |> put_pass_hash()
  end

  def get_signed_jwt(%User{} = user) do
    claims = %{
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      name: user.name,
      class: user.class
    }
    case Api.Guardian.encode_and_sign(user, claims) do
      {:ok, jwt, _} -> {:ok, jwt}
      error -> error
    end
  end

  defp put_pass_hash(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: password}} ->
        put_change(changeset, :password_hash, Bcrypt.hash_pwd_salt(password))
      _ ->
        changeset
    end
  end

  defp put_assoc_avatar_image_file(user, %{avatar_image_file: %{id: avatar_image_file_id}}) do
    user
    |> put_assoc(:avatar_image_file, Repo.get(Api.Accounts.File, avatar_image_file_id))
  end
  defp put_assoc_avatar_image_file(user, %{avatar_image_file: nil}) do
    user
    |> put_assoc(:avatar_image_file, nil)
  end
  defp put_assoc_avatar_image_file(user, _args), do: user

  defp put_assoc_enrollment_tokens(user, %{enrollment_tokens: enrollment_tokens}) do
    user
    |> put_assoc(:enrollment_tokens, Enum.map(enrollment_tokens, &(%{ enrollment_token: &1 })))
  end
  defp put_assoc_enrollment_tokens(user, _args), do: user

  defp validate_has_nickname_if_hide_full_name_is_set(%Ecto.Changeset{} = changeset) do
    case fetch_field(changeset, :hide_full_name) do
      {_, true} ->
        validate_required(changeset, :nickname)
      _ ->
        changeset
    end
  end
end
