defmodule LottaWeb.FallbackController do
  use LottaWeb, :controller

  def call(conn, {:error, :bad_request}) do
    conn
    |> put_status(:bad_request)
    |> put_view(json: LottaWeb.ErrorJSON, html: LottaWeb.ErrorHTML)
    |> render(:"400")
  end

  def call(conn, {:error, :unauthorized}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(json: LottaWeb.ErrorJSON, html: LottaWeb.ErrorHTML)
    |> render(:"401")
  end

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(json: LottaWeb.ErrorJSON, html: LottaWeb.ErrorHTML)
    |> render(:"404")
  end

  def call(conn, error) when is_exception(error) do
    conn
    |> put_status(:internal_server_error)
    |> put_view(json: LottaWeb.ErrorJSON, html: LottaWeb.ErrorHTML)
    |> render(:"500")
  end
end
