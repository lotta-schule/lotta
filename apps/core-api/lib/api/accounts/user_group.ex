defmodule Api.Accounts.UserGroup do
  use Ecto.Schema
  import Ecto.Changeset

  alias Api.Accounts.User
  alias Api.Repo

  schema "user_groups" do
    field :name, :string
    field :sort_key, :integer
    field :is_admin_group, :boolean

    belongs_to :tenant, Api.Tenants.Tenant
    has_many :enrollment_tokens, Api.Accounts.GroupEnrollmentToken,
      foreign_key: :group_id,
      on_replace: :delete
    many_to_many :users,
      User,
      join_through: "user_user_group",
      on_replace: :delete

    timestamps()
  end

  @doc false
  def changeset(user_group, attrs) do
    user_group
    |> Repo.preload(:enrollment_tokens)
    |> cast(attrs, [:name, :sort_key, :is_admin_group])
    |> validate_required([:name, :sort_key])
    |> put_assoc_enrollment_tokens(attrs)
  end

  defp put_assoc_enrollment_tokens(user_group, %{enrollment_tokens: tokens}) do
    user_group
    |> put_assoc(:enrollment_tokens, Enum.map(tokens, &(%{ token: &1 })))
  end
  defp put_assoc_enrollment_tokens(user_group, _args), do: user_group
end
