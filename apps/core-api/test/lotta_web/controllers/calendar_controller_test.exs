defmodule LottaWeb.CalendarControllerTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Phoenix.ConnTest
  import Lotta.Factory

  @prefix "tenant_test"

  describe "calendar_controller" do
    test "should show the calendar ics data if the calendar is publicly available" do
      calendar = insert(:publicly_available_calendar, [], prefix: @prefix)

      response =
        build_tenant_conn()
        |> get("/data/calendar/#{calendar.id}/ics")
        |> response(200)

      assert response =~ calendar.name
      assert response =~ calendar.color
    end

    test "should show a 404 error when the calendar is not publicly visible" do
      calendar = insert(:calendar, [], prefix: @prefix)

      response =
        build_tenant_conn()
        |> get("/data/calendar/#{calendar.id}/ics")
        |> response(404)

      assert bit_size(response) == 0
    end

    test "should show a 404 error when the calendar does not exist" do
      response =
        build_tenant_conn()
        |> get("/data/calendar/0000-0000-0000-0000/ics")
        |> response(404)

      assert bit_size(response) == 0
    end
  end
end
