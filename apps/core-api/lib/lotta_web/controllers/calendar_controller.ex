defmodule LottaWeb.CalendarController do
  @moduledoc """
  Translates controller action results into valid `Plug.Conn` responses.
  """
  use LottaWeb, :controller

  import Plug.Conn

  alias Lotta.{Calendar, Repo}

  def get(conn, %{"id" => id}) do
    calendar =
      Calendar.get_calendar(id)
      |> Repo.preload(:events)

    if is_nil(calendar) do
      conn
      |> put_status(404)
      |> put_view(LottaWeb.ErrorView)
      |> render(:"404")
    else
      conn
      |> put_resp_header("content-type", "text/calendar")
      |> send_resp(200, Calendar.Renderer.to_ics(calendar))
    end
  end
end
