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
    has_many :files, Api.Accounts.File
    many_to_many :groups,
      UserGroup,
      join_through: "user_user_group",
      on_replace: :delete
    many_to_many(
      :articles,
      Article,
      join_through: "article_users",
      on_replace: :delete
    )

    timestamps()
  end

  def is_admin?(%User{} = user, %Tenant{} = tenant) do
    IO.inspect(tenant)
    tenant_id = tenant.id
    user
    |> Repo.preload(:groups)
    |> Map.fetch!(:groups)
    |> Enum.find(fn group -> Kernel.match?(%{tenant_id: ^tenant_id, is_admin_group: true}, group) end)
    |> is_nil
    |> Kernel.not
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :class, :email])
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
    |> cast(params, [:name, :class, :nickanme, :email], [:password])
    |> validate_required([:name, :email])
    |> put_pass_hash()
  end

  def registration_changeset(%User{} = user, params \\ %{}) do
    user
    |> cast(params, [:name, :class, :nickname, :email, :password, :tenant_id])
    |> validate_required([:name, :email, :password, :tenant_id])
    |> put_pass_hash()
  end

  defp put_pass_hash(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: password}} -> put_change(changeset, :password_hash, Bcrypt.hash_pwd_salt(password))
      _ -> changeset
    end
  end
end
