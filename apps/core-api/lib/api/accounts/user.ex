defmodule Api.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Api.Repo
  alias Api.Accounts.{User,UserGroup}
  alias Api.Content.Article
  alias Api.Tenants.Tenant

  schema "users" do
    field :email, :string
    field :name, :string
    field :nickname, :string
    field :class, :string
    field :password, :string, virtual: true
    field :password_hash, :string

    belongs_to :tenant, Api.Tenants.Tenant
    belongs_to :avatar_image_file, Api.Accounts.File, on_replace: :nilify
    has_many :files, Api.Accounts.File
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

  def is_admin?(%User{} = user, %Tenant{} = tenant) do
    tenant_id = tenant.id
    user
    |> Repo.preload(:groups)
    |> Map.fetch!(:groups)
    |> Enum.find(fn group -> Kernel.match?(%{tenant_id: ^tenant_id, is_admin_group: true}, group) end)
    |> is_nil
    |> Kernel.not
  end

  def is_author?(%User{} = user, %Article{} = article) do
    article
    |> Repo.preload(:users)
    |> Map.get(:users)
    |> Enum.find(fn u -> u.id == user.id end)
    |> is_nil
    |> Kernel.not
  end

  def has_group_for_article?(%User{} = user, %Article{} = article) do
    article = Repo.preload(article, [:group, :tenant])
    if is_nil(article.group) do
      true
    else
      article.group.priority <= get_max_priority_for_tenant(user, article.tenant)
    end
  end

  def get_max_priority_for_tenant(%User{} = user, %Tenant{} = tenant) do
    user.groups
      |> Enum.filter(fn g -> g.tenant_id == tenant.id end)
      |> Enum.map(fn g -> g.priority end)
      |> Enum.max(fn -> 0 end)
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :class, :email])
    |> unique_constraint(:email)
    |> validate_required([:name, :email])
  end

  @doc false
  def assign_group_changeset(user, %{group: newgroup}) do
    groups = Repo.all(from g in UserGroup, where: g.tenant_id != ^newgroup.tenant_id) ++ [newgroup]
    user
    |> Repo.preload(:groups)
    |> Ecto.Changeset.change
    |> put_assoc(:groups, groups)
  end

  def update_changeset(%User{} = user, params \\ %{}) do
    user
    |> Repo.preload(:avatar_image_file)
    |> cast(params, [:name, :class, :nickname, :email], [:password])
    |> validate_required([:name, :email])
    |> unique_constraint(:email)
    |> put_pass_hash()
    |> put_assoc_avatar_image_file(params)
  end

  def registration_changeset(%User{} = user, params \\ %{}) do
    user
    |> cast(params, [:name, :class, :nickname, :email, :password, :tenant_id])
    |> validate_required([:name, :email, :password, :tenant_id])
    |> unique_constraint(:email)
    |> put_pass_hash()
  end

  defp put_pass_hash(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: password}} ->
        put_change(changeset, :password_hash, Bcrypt.hash_pwd_salt(password))
      _ ->
        changeset
    end
  end

  defp put_assoc_avatar_image_file(article, %{ avatar_image_file: %{ id: avatar_image_file_id } }) do
    article
    |> put_assoc(:avatar_image_file, Api.Repo.get(Api.Accounts.File, avatar_image_file_id))
  end
  defp put_assoc_avatar_image_file(article, _args), do: article
end
