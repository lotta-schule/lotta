defmodule ApiWeb.Auth.AbsintheHooks do
  @moduledoc """
  Hooks in Absinthe Lifecycle. Turns absinthe token into cookie.
  """

  alias Api.Accounts.User

  def before_send(conn, %Absinthe.Blueprint{execution: %{context: %{sign_out_user: true}}}) do
    conn
    |> ApiWeb.Auth.AccessToken.Plug.sign_out(clear_remember_me: true)
  end

  def before_send(conn, %Absinthe.Blueprint{
        execution: %{context: %{sign_in_user: %User{} = user}}
      }) do
    conn
    |> ApiWeb.Auth.AccessToken.Plug.remember_me(user)
  end

  def before_send(conn, _) do
    conn
  end
end
