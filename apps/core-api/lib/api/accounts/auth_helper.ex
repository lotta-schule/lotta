defmodule Api.Accounts.AuthHelper do
  @moduledoc """
    Helper module for authentication purposes
  """

  import Bcrypt
  import Ecto.Query
  alias Api.Repo
  alias Api.Accounts.User
  alias Api.Tenants.Tenant

  def login_with_username_pass(username, given_pass) do
    username = String.downcase(username)

    user =
      Repo.one(
        from u in User,
          where: fragment("lower(?)", u.email) == ^username
      )

    if user && verify_pass(given_pass, user.password_hash) do
      {:ok, user}
    else
      {:error, "Falsche Zugangsdaten."}
    end
  end

  def check_if_blocked(%User{} = user, %Tenant{} = tenant) do
    if User.is_blocked?(user, tenant) do
      {:error, "Du wurdest für diese Seite geblockt. Du darfst dich nicht anmelden."}
    else
      :ok
    end
  end
end
