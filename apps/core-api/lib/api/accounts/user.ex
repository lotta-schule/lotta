defmodule Api.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset
  alias Api.Accounts.User

  schema "users" do
    field :email, :string
    field :name, :string
    field :password, :string, virtual: true
    field :password_hash, :string

    has_many :articles, Api.Content.Article
    has_many :files, Api.Accounts.File

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :email])
    |> validate_required([:name, :email])
  end

  def update_changeset(%User{} = user, params \\ %{}) do
    user
    |> cast(params, [:name, :email], [:password])
    |> validate_required([:name, :email])
    |> put_pass_hash()
  end

  def registration_changeset(%User{} = user, params \\ %{}) do
    user
    |> cast(params, [:name, :email, :password])
    |> validate_required([:name, :email, :password])
    |> put_pass_hash()
  end

  defp put_pass_hash(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: password}} -> put_change(changeset, :password_hash, Bcrypt.hash_pwd_salt(password))
      _ -> changeset
    end
  end
end
