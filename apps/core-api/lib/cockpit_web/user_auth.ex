defmodule CockpitWeb.UserAuth do
  @moduledoc false

  import Plug.Conn
  import Phoenix.Controller

  use CockpitWeb, :verified_routes

  @cookie_name "cockpit_jwt"

  def log_in(conn) do
    {:ok, token, _claims} = CockpitWeb.Auth.Token.generate_and_sign()

    conn
    |> put_session(@cookie_name, token)
    |> redirect(to: signed_in_path(conn))
  end

  def log_out(conn) do
    conn
    |> configure_session(drop: true)
    |> redirect(to: ~p"/users/login")
    |> halt()
  end

  def fetch_current_user(conn, _opts) do
    current_user =
      conn
      |> fetch_session()
      |> get_session(@cookie_name)
      |> get_user_from_token()

    if current_user do
      assign(conn, :current_user, current_user)
    else
      forbidden(conn)
    end
  end

  def get_user_from_token(nil), do: nil

  def get_user_from_token(token) do
    token
    |> CockpitWeb.Auth.Token.verify_and_validate()
    |> case do
      {:ok, claims} -> claims
      {:error, _reason} -> nil
    end
  end

  @doc """
  Used for routes that require the user to not be authenticated.
  """
  def redirect_if_user_is_authenticated(conn, _opts) do
    if conn.assigns[:current_user] do
      conn
      |> redirect(to: signed_in_path(conn))
      |> halt()
    else
      conn
    end
  end

  @doc """
  Used for routes that require the user to be authenticated.

  If you want to enforce the user email is confirmed before
  they use the application at all, here would be a good place.
  """
  def require_authenticated_user(%{assigns: %{current_user: user}} = conn, _opts)
      when not is_nil(user),
      do: conn

  def require_authenticated_user(conn, _opts), do: forbidden(conn)

  defp signed_in_path(_conn), do: "/"

  defp forbidden(conn) do
    conn
    |> maybe_redirect_to_login_path()
  end

  defp maybe_redirect_to_login_path(conn) do
    if current_path(conn) != "/users/login" do
      redirect(conn, to: "/users/login")
      |> halt()
    else
      conn
    end
  end
end
