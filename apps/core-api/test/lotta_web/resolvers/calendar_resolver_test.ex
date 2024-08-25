defmodule LottaWeb.CalendarResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase, async: true

  import Lotta.Factory

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
        insert(:calendar, events: build_list(62, :calendar_event, []))

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
    mutation createCalendarEvent($calendarId: ID!, $data: CalendarEventInput!) {
      createCalendarEvent(calendarId: $calendarId, data: $data) {
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
      %{id: calendar_id} = calendar = insert(:calendar, [], prefix: @prefix)
      admin = insert(:admin_user, [], prefix: @prefix)

      res =
        build_tenant_conn()
        |> authorize(admin)
        |> post("/api",
          query: @query,
          variables: %{
            calendarId: calendar.id,
            data: %{
              summary: "Test Event",
              description: "Test Description",
              start: "2021-01-01 00:00:00Z",
              end: "2021-01-01 23:59:59Z",
              isFullDay: true,
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
      %{id: calendar_id} = calendar = insert(:calendar, [], prefix: @prefix)
      event = insert(:calendar_event, [calendar_id: calendar.id], prefix: @prefix)

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
  end
end
