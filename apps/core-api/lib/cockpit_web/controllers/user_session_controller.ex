defmodule CockpitWeb.UserSessionController do
  use CockpitWeb, :controller

  alias CockpitWeb.UserAuth

  def new(conn, _params) do
    render(conn, :new, error_message: nil)
  end

  def create(
        conn,
        %{
          "user" => user_params
        }
      ) do
    if user_params["username"] == get_config(:username) &&
         user_params["password"] == get_config(:password) do
      conn
      |> put_flash(:info, "Willkommen zurück, Capt'n!")
      |> UserAuth.log_in()
    else
      conn
      |> put_flash(:info, "Falsche Zugangsdaten")
      |> UserAuth.log_out()
    end
  end

  def create(conn, _params) do
    conn
    |> render(:new, error_message: "Falsche Zugangsdaten")
  end

  def delete(conn, _params) do
    conn
    |> put_flash(:info, "Erfolgreich abgemeldet")
    |> UserAuth.log_out()
  end

  defp get_config(key) do
    Application.get_env(:lotta, :cockpit)
    |> Keyword.get(key)
  end
end
