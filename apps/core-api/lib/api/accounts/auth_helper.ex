defmodule Api.Accounts.AuthHelper do
  @moduledoc false

  import Bcrypt
  alias Api.Repo
  alias Api.Accounts.User
  alias Api.Tenants.Tenant

  def login_with_username_pass(username, given_pass) do
    user = Repo.get_by(User, email: String.downcase(username))
    cond do
      user && verify_pass(given_pass, user.password_hash) -> {:ok, user}
      true -> {:error, "Falsche Zugangsdaten."}
    end
  end

  def check_if_blocked(%User{} = user, %Tenant{} = tenant) do
    case User.is_blocked?(user, tenant) do
      true ->
        {:error, "Du wurdest für diese Seite geblockt. Du darfst dich nicht anmelden."}
      false ->
        :ok
    end
  end
end