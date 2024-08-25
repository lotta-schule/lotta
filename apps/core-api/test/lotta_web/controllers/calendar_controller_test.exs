defmodule LottaWeb.CalendarControllerTest do
  @moduledoc false

  use LottaWeb.ConnCase, async: true

  import Phoenix.ConnTest
  import Lotta.Factory

  @prefix "tenant_test"

  describe "calendar_controller" do
    test "should show the calendar ics data if the calendar is publicly available" do
      calendar = insert(:calendar, [], prefix: @prefix)

      build_conn()
      |> put_req_header("tenant", "slug:test")
      |> get("/data/calendar/#{calendar.id}")
      |> json_response(404)
    end

    test "should show a 404 error when the calendar is not publicly visible" do
      calendar = insert(:calendar, [], prefix: @prefix)

      build_conn()
      |> put_req_header("tenant", "slug:test")
      |> get("/data/calendar/#{calendar.id}")
      |> json_response(404)
    end

    test "should show a 404 error when the calendar does not exist" do
      build_conn()
      |> put_req_header("tenant", "slug:test")
      |> get("/data/calendar/0000-0000-0000-0000")
      |> json_response(404)
    end
  end
end
