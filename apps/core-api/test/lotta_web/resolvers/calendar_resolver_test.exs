defmodule LottaWeb.CalendarResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Lotta.Factory

  alias Lotta.Repo

  @prefix "tenant_test"

  describe "list" do
    @query """
    query calendars {
      calendars {
        id
        name
      }
    }
    """
    test "should return all calendars" do
      insert_list(3, :calendar, [], prefix: @prefix)

      admin = insert(:admin_user, [], prefix: @prefix)

      res =
        build_tenant_conn()
        |> authorize(admin)
        |> get("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "calendars" => calendars
               }
             } = res

      assert length(calendars) == 3
    end
  end

  describe "list calendar events" do
    @query """
    query calendarEvents($id: ID!, $from: DateTime!, $latest: DateTime!) {
      calendarEvents(calendarId: $id, from: $from, latest: $latest) {
        id
        summary
      }
    }
    """
    test "returns all the events belonging to a calendar" do
      calendar =
        insert(:calendar, [events: build_list(62, :calendar_event, [])], prefix: @prefix)

      admin = insert(:admin_user, [], prefix: @prefix)

      res =
        build_tenant_conn()
        |> authorize(admin)
        |> get("/api",
          query: @query,
          variables: %{
            id: calendar.id,
            from: "2021-01-01 00:00:00Z",
            latest: "2021-12-31 23:59:59Z"
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "calendarEvents" => events
               }
             } = res

      assert length(events) == 62
    end
  end

  describe "create calendar" do
    @query """
    mutation createCalendar($data: CalendarInput!) {
      createCalendar(data: $data) {
        id
        name
        color
        isPubliclyAvailable
      }
    }
    """
    test "creates a calendar when given the data" do
      admin = insert(:admin_user, [], prefix: @prefix)

      res =
        build_tenant_conn()
        |> authorize(admin)
        |> post("/api",
          query: @query,
          variables: %{
            data: %{
              name: "Test Calendar",
              color: "#45abce"
            }
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "createCalendar" => %{
                   "id" => _id,
                   "name" => "Test Calendar",
                   "color" => "#45abce",
                   "isPubliclyAvailable" => false
                 }
               }
             } = res
    end
  end

  describe "create calendar event" do
    @query """
    mutation createCalendarEvent($data: CalendarEventInput!) {
      createCalendarEvent(data: $data) {
        id
        summary
        description
        start
        end
        isFullDay
        recurrence {
          frequency
          interval
        }
        calendar {
          id
        }
      }
    }
    """
    test "creates an event for a given calendar when given the data" do
      %{id: calendar_id} = insert(:calendar, [], prefix: @prefix)
      admin = insert(:admin_user, [], prefix: @prefix)

      res =
        build_tenant_conn()
        |> authorize(admin)
        |> post("/api",
          query: @query,
          variables: %{
            data: %{
              summary: "Test Event",
              description: "Test Description",
              start: "2021-01-01 00:00:00Z",
              end: "2021-01-01 23:59:59Z",
              isFullDay: true,
              calendarId: calendar_id,
              recurrence: %{
                frequency: "WEEKLY",
                interval: 2
              }
            }
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "createCalendarEvent" => %{
                   "id" => _id,
                   "summary" => "Test Event",
                   "description" => "Test Description",
                   "start" => "2021-01-01T00:00:00Z",
                   "end" => "2021-01-01T23:59:59Z",
                   "isFullDay" => true,
                   "recurrence" => %{
                     "frequency" => "WEEKLY",
                     "interval" => 2
                   },
                   "calendar" => %{
                     "id" => ^calendar_id
                   }
                 }
               }
             } = res
    end
  end

  describe "update calendar" do
    @query """
    mutation updateCalendar($id: ID!, $data: CalendarInput!) {
      updateCalendar(id: $id, data: $data) {
        id
        name
        color
        isPubliclyAvailable
        subscriptionUrl
      }
    }
    """
    test "updates a calendar when given the data" do
      %{id: calendar_id} = insert(:calendar, [], prefix: @prefix)

      admin = insert(:admin_user, [], prefix: @prefix)

      res =
        build_tenant_conn()
        |> authorize(admin)
        |> post("/api",
          query: @query,
          variables: %{
            id: calendar_id,
            data: %{
              name: "Updated Calendar",
              color: "#45abce",
              isPubliclyAvailable: true
            }
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateCalendar" => %{
                   "id" => ^calendar_id,
                   "name" => "Updated Calendar",
                   "color" => "#45abce",
                   "isPubliclyAvailable" => true,
                   "subscriptionUrl" =>
                     "https://test.lotta.schule/data/calendar/" <> ^calendar_id <> "/ics"
                 }
               }
             } = res
    end
  end

  describe "update calendar event" do
    @query """
    mutation updateCalendarEvent($id: ID!, $data: CalendarEventInput!) {
      updateCalendarEvent(id: $id, data: $data) {
        id
        summary
        description
        start
        end
        isFullDay
        recurrence {
          frequency
          interval
        }
        calendar {
          id
        }
      }
    }
    """
    test "creates an event for a given calendar when given the data" do
      %{id: calendar_id} = insert(:calendar, [], prefix: @prefix)
      event = insert(:calendar_event, [calendar_id: calendar_id], prefix: @prefix)

      admin = insert(:admin_user, [], prefix: @prefix)

      res =
        build_tenant_conn()
        |> authorize(admin)
        |> post("/api",
          query: @query,
          variables: %{
            id: event.id,
            data: %{
              summary: "Updated test event",
              calendarId: calendar_id,
              description: "This is a new description",
              start: "2024-01-01 18:00:00Z",
              end: "2024-01-01 18:30:00Z",
              isFullDay: false,
              recurrence: %{
                frequency: "MONTHLY",
                interval: 1
              }
            }
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateCalendarEvent" => %{
                   "id" => _id,
                   "summary" => "Updated test event",
                   "description" => "This is a new description",
                   "start" => "2024-01-01T18:00:00Z",
                   "end" => "2024-01-01T18:30:00Z",
                   "isFullDay" => false,
                   "recurrence" => %{
                     "frequency" => "MONTHLY",
                     "interval" => 1
                   },
                   "calendar" => %{
                     "id" => ^calendar_id
                   }
                 }
               }
             } = res
    end

    test "gets an error when the event does not exist" do
      %{id: calendar_id} = insert(:calendar, [], prefix: @prefix)
      event = insert(:calendar_event, [calendar_id: calendar_id], prefix: @prefix)

      admin = insert(:admin_user, [], prefix: @prefix)

      wrong_id = String.replace(event.id, ~r/^[0-9a-f]{8}/, "99999999")

      res =
        build_tenant_conn()
        |> authorize(admin)
        |> post("/api",
          query: @query,
          variables: %{
            id: wrong_id,
            data: %{
              summary: "Updated test event",
              calendarId: calendar_id,
              description: "This is a new description",
              start: "2024-01-01 18:00:00Z",
              end: "2024-01-01 18:30:00Z",
              isFullDay: false,
              recurrence: %{
                frequency: "MONTHLY",
                interval: 1
              }
            }
          }
        )
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "path" => ["updateCalendarEvent"],
                   "message" => "Event not found"
                 }
               ]
             } = res

      assert Repo.reload(event, prefix: @prefix).summary == event.summary
    end
  end

  describe "delete calendar event" do
    @query """
    mutation deleteCalendarEvent($id: ID!) {
      deleteCalendarEvent(id: $id) {
        id
      }
    }
    """
    test "deletes an event with a given id" do
      %{id: calendar_id} = insert(:calendar, [], prefix: @prefix)

      %{id: event_id} =
        event = insert(:calendar_event, [calendar_id: calendar_id], prefix: @prefix)

      admin = insert(:admin_user, [], prefix: @prefix)

      res =
        build_tenant_conn()
        |> authorize(admin)
        |> post("/api",
          query: @query,
          variables: %{
            id: event.id
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "deleteCalendarEvent" => %{
                   "id" => id
                 }
               }
             } = res

      assert id == event_id
    end

    test "returns an error when the calendar id does not exist" do
      %{id: calendar_id} = insert(:calendar, [], prefix: @prefix)

      %{id: event_id} =
        event = insert(:calendar_event, [calendar_id: calendar_id], prefix: @prefix)

      wrong_id = String.replace(event_id, ~r/^[0-9a-f]{8}/, "99999999")

      admin = insert(:admin_user, [], prefix: @prefix)

      res =
        build_tenant_conn()
        |> authorize(admin)
        |> post("/api",
          query: @query,
          variables: %{
            id: wrong_id
          }
        )
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "path" => ["deleteCalendarEvent"],
                   "message" => "Event not found"
                 }
               ]
             } = res

      assert Repo.get(Lotta.Calendar.CalendarEvent, event.id, prefix: @prefix) == event
    end
  end

  describe "external calendar" do
    setup do
      Tesla.Mock.mock(fn
        %{method: :get, url: "https://example.com/calendar.ics"} ->
          {:ok,
           %Tesla.Env{
             status: 200,
             body: create_ical_data(),
             headers: [{"content-type", "text/calendar"}]
           }}
      end)
    end

    @query """
    query externalCalendarEvents($url: String!, $days: Int) {
      externalCalendarEvents(url: $url, days: $days) {
        uid
        description
        summary
        start
        end
      }
    }
    """
    test "get a simple calendar and list events for the next four days" do
      create_ical_data()

      res =
        build_tenant_conn()
        |> post("/api",
          query: @query,
          variables: %{
            url: "https://example.com/calendar.ics",
            days: 4
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "externalCalendarEvents" => events
               }
             } = res

      assert length(events) == 1

      assert [
               %{
                 "summary" => "Picnick",
                 "start" => _dtstart,
                 "end" => _dtend
               }
             ] = events
    end
  end

  defp create_ical_data do
    # This function should create a simple iCal file with some events
    # The events are:
    # - Picnick in 3 days, summary: 'Picnick', start at 11.00, end at 14.00
    # - Test event in 5 days, summary: 'Test Event', start at 10.00, end at 12.00
    # - Test event in 7 days, summary: 'Test Event XY', start at 14.00, end at 17.00
    # - Christmas 2100 should also be included, as a whole day event
    ical_data =
      """
      BEGIN:VCALENDAR
      VERSION:2.0
      PRODID:-//Example Corp//Example Calendar//EN
      CALSCALE:GREGORIAN
      BEGIN:VEVENT
      UID: #{UUID.uuid4()}
      SUMMARY:Picnick
      DTSTAMP:#{DateTime.utc_now() |> to_ics_date()}
      DTSTART:#{DateTime.utc_now() |> DateTime.add(3 * 24 * 60 * 60, :second) |> to_ics_date()}
      DTEND:#{DateTime.utc_now() |> DateTime.add(3 * 24 * 60 * 60, :second) |> DateTime.add(3 * 60 * 60, :second) |> to_ics_date()}
      END:VEVENT
      BEGIN:VEVENT
      UID: #{UUID.uuid4()}
      SUMMARY:Test Event
      DTSTAMP:#{DateTime.utc_now() |> to_ics_date()}
      DTSTART:#{DateTime.utc_now() |> DateTime.add(5 * 24 * 60 * 60, :second) |> to_ics_date()}
      DTEND:#{DateTime.utc_now() |> DateTime.add(5 * 24 * 60 * 60, :second) |> DateTime.add(2 * 60 * 60, :second) |> to_ics_date()}
      END:VEVENT
      BEGIN:VEVENT
      UID: #{UUID.uuid4()}
      SUMMARY:Test Event XY
      DTSTAMP:#{DateTime.utc_now() |> to_ics_date()}
      DTSTART:#{DateTime.utc_now() |> DateTime.add(7 * 24 * 60 * 60, :second) |> to_ics_date()}
      DTEND:#{DateTime.utc_now() |> DateTime.add(7 * 24 * 60 * 60, :second) |> DateTime.add(3 * 60 * 60, :second) |> to_ics_date()}
      END:VEVENT
      BEGIN:VEVENT
      UID: #{UUID.uuid4()}
      SUMMARY:Christmas
      DTSTAMP:#{DateTime.utc_now() |> to_ics_date()}
      DTSTART;VALUE=DATE:21001225
      DTEND;VALUE=DATE:21001226
      END:VEVENT
      END:VCALENDAR
      """
      |> String.trim()
      |> String.replace("\n", "\r\n")

    ical_data
  end

  defp to_ics_date(date) do
    date
    |> DateTime.truncate(:second)
    |> DateTime.to_iso8601()
    |> String.replace(~r/-|:/, "")
  end
end
