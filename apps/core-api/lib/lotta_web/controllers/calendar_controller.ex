defmodule LottaWeb.CalendarController do
  @moduledoc """
  Translates controller action results into valid `Plug.Conn` responses.
  """
  use LottaWeb, :controller

  import Plug.Conn
  import Lotta.Guard

  alias Lotta.{Calendar, Repo}

  def get(conn, %{"id" => id}) when is_uuid(id) do
    calendar =
      Calendar.get_calendar(id)
      |> Repo.preload(:events)

    case calendar do
      %Calendar.Calendar{is_publicly_available: true} = calendar ->
        conn
        |> put_resp_header("content-type", "text/calendar")
        |> send_resp(200, Calendar.Renderer.to_ics(calendar))

      _ ->
        conn
        |> respond_with(:not_found)
    end
  end

  def get(conn, _params), do: respond_with(conn, :not_found)

  defp respond_with(conn, :not_found),
    do:
      conn
      |> resp(404, "")
      |> send_resp()
end
