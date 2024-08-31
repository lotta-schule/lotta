defmodule Lotta.CalendarTest do
  @moduledoc false

  use Lotta.DataCase

  import Lotta.Factory

  alias Lotta.{Calendar, Repo}

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)

    :ok
  end

  describe "calendar" do
    test "list calendars" do
      insert_list(3, :calendar, [], prefix: @prefix)

      calendars = Calendar.list_calendars()

      assert length(calendars) == 3
    end

    test "get calendar" do
      calendar = insert(:calendar, [], prefix: @prefix)

      assert calendar == Calendar.get_calendar(calendar.id)
    end

    test "get calendar event" do
      calendar = insert(:calendar, [], prefix: @prefix)
      event = insert(:calendar_event, [calendar_id: calendar.id], prefix: @prefix)

      assert event == Calendar.get_calendar_event(event.id)
    end

    test "list calendar events" do
      calendar =
        insert(:calendar, [events: build_list(62, :calendar_event, [])], prefix: @prefix)

      events = Calendar.list_calendar_events(calendar)

      assert length(events) == 62
    end

    test "create calendar" do
      data = %{
        name: "Test Calendar"
        # description: "This is a test calendar"
      }

      {:ok, calendar} = Calendar.create_calendar(data)

      assert calendar.name == "Test Calendar"
      # assert calendar.description == "This is a test calendar"

      assert Repo.get(Calendar.Calendar, calendar.id) == calendar
    end

    test "create calendar event" do
      calendar = insert(:calendar, [], prefix: @prefix)

      data = %{
        summary: "Test Event",
        description: "This is a test event",
        start: ~U[2021-01-01 00:00:00Z],
        end: ~U[2021-01-01 01:00:00Z],
        is_all_day: false
      }

      {:ok, event} = Calendar.create_event(calendar, data)

      assert event.calendar_id == calendar.id
      assert event.summary == "Test Event"
      assert event.description == "This is a test event"
      assert event.start == ~U[2021-01-01 00:00:00Z]
      assert event.end == ~U[2021-01-01 01:00:00Z]

      assert Repo.get(Calendar.CalendarEvent, event.id) == event
    end

    test "update calendar" do
      calendar = insert(:calendar, [], prefix: @prefix)

      data = %{
        name: "Updated Calendar"
      }

      {:ok, updated_calendar} = Calendar.update_calendar(calendar, data)

      assert updated_calendar.name == "Updated Calendar"

      assert Repo.get(Calendar.Calendar, calendar.id) == updated_calendar
    end

    test "update calendar event" do
      calendar = insert(:calendar, [], prefix: @prefix)
      event = insert(:calendar_event, [calendar_id: calendar.id], prefix: @prefix)

      data = %{
        summary: "Updated Event",
        description: "This is an updated event",
        start: ~U[2022-01-01 00:00:00Z],
        end: ~U[2022-01-02 23:59:59Z],
        is_full_day: true
      }

      {:ok, event} = Calendar.update_event(event, data)

      assert event.calendar_id == calendar.id
      assert event.summary == "Updated Event"
      assert event.description == "This is an updated event"
      assert event.start == ~U[2022-01-01 00:00:00Z]
      assert event.end == ~U[2022-01-02 23:59:59Z]
      assert event.is_full_day == true

      assert Repo.get(Calendar.CalendarEvent, event.id) == event
    end

    test "delete calendar event" do
      calendar = insert(:calendar, [], prefix: @prefix)
      event = insert(:calendar_event, [calendar_id: calendar.id], prefix: @prefix)

      assert Calendar.delete_event(event) == :ok

      assert Repo.get(Calendar.CalendarEvent, event.id) == nil
    end
  end
end
