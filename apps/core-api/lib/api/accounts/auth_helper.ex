defmodule Api.Accounts.AuthHelper do
  @moduledoc false

  import Bcrypt
  alias Api.Repo
  alias Api.Accounts.User

  def login_with_username_pass(username, given_pass) do
    IO.puts username
    IO.puts given_pass
    user = Repo.get_by(User, email: String.downcase(username))
    cond do
      user && verify_pass(given_pass, user.password_hash) -> {:ok, user}
      true -> {:error, "Incorrect Login Credentials"}
    end
  end
end