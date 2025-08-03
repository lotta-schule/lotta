defmodule LottaWeb.CalendarResolver do
  @moduledoc false

  alias LottaWeb.Urls
  alias Lotta.Calendar.CalendarEvent

  require Logger

  def get_external(%{url: url} = args, _info) do
    with {:ok, body} <- fetch_calendar_data(url) do
      start_date = DateTime.now!("Europe/Berlin") |> DateTime.add(-60 * 60 * 24, :second)
      end_date = DateTime.now!("Europe/Berlin") |> Timex.shift(days: args[:days] || 90)

      is_in_between = fn
        nil, _, _ -> true
        date, start, enddate -> Timex.between?(date, start, enddate, inclusive: true)
      end

      events =
        body
        |> ExIcal.parse()
        |> ExIcal.Recurrence.add_recurring_events(end_date)
        |> Enum.filter(fn event ->
          is_in_between.(event.start, start_date, end_date) &&
            is_in_between.(event.end, start_date, end_date)
        end)
        |> ExIcal.sort_by_date()

      {:ok, events}
    end
  rescue
    e ->
      Logger.error(e)
      {:error, :invalid_calendar_format}
  end

  def list(_args, _context) do
    {:ok, Lotta.Calendar.list_calendars()}
  end

  def list_calendar_events(
        %{calendar_id: id} = args,
        _context
      ) do
    opts =
      args
      |> Map.take([:from, :latest, :limit])
      |> Enum.into([])

    case Lotta.Calendar.get_calendar(id) do
      nil ->
        {:error, "Calendar not found"}

      calendar ->
        calendar
        |> Lotta.Calendar.list_calendar_events(opts)
        |> Enum.map(&format_event/1)
        |> then(&{:ok, &1})
    end
  end

  def create(%{data: data}, _info) do
    Lotta.Calendar.create_calendar(data)
  end

  def create_event(%{data: %{calendar_id: calendar_id} = data}, _context) do
    with calendar when not is_nil(calendar) <- Lotta.Calendar.get_calendar(calendar_id),
         {:ok, event} <-
           Lotta.Calendar.create_event(
             calendar,
             parse_event_input(data)
           ) do
      {:ok, format_event(event)}
    else
      nil ->
        {:error, "Calendar not found"}

      error ->
        error
    end
  end

  def update(%{id: id, data: data}, _info) do
    case Lotta.Calendar.get_calendar(id) do
      nil ->
        {:error, "Calendar not found"}

      calendar ->
        Lotta.Calendar.update_calendar(calendar, data)
    end
  end

  def update_event(%{id: id, data: data}, _info) do
    with event when not is_nil(event) <- Lotta.Calendar.get_calendar_event(id),
         {:ok, event} <-
           Lotta.Calendar.update_event(
             event,
             parse_event_input(data)
           ) do
      {:ok, format_event(event)}
    else
      nil ->
        {:error, "Event not found"}

      error ->
        error
    end
  end

  def delete_event(%{id: id}, _info) do
    with event when not is_nil(event) <- Lotta.Calendar.get_calendar_event(id),
         :ok <-
           Lotta.Calendar.delete_event(event) do
      {:ok, format_event(event)}
    else
      nil ->
        {:error, "Event not found"}

      error ->
        error
    end
  end

  def resolve_subscription_url(%{is_publicly_available: true, id: id}, _args, %{
        context: %{tenant: tenant}
      }),
      do:
        {:ok,
         LottaWeb.Router.Helpers.calendar_ics_url(
           Urls.get_tenant_uri(tenant),
           :get,
           id
         )}

  def resolve_subscription_url(_calendar, _args, _info), do: {:ok, nil}

  def format_event(%CalendarEvent{} = event) do
    event
    |> Map.put(:recurrence, get_recurrence(event))
    |> Map.reject(fn {key, _val} -> String.starts_with?(to_string(key), "recurrence_") end)
  end

  defp fetch_calendar_data(url) do
    ConCache.get_or_store(:http_cache, url, fn ->
      with {:ok, %{body: body}} <- Tesla.get(http_client(), url) do
        {:ok, body}
      end
    end)
  end

  defp http_client() do
    middleware = [
      {Tesla.Middleware.Headers,
       [
         {"Accept-Charset", "utf-8"},
         {"User-Agent", "Lotta"}
       ]},
      Tesla.Middleware.DecompressResponse
    ]

    Lotta.Tesla.create_client(middleware)
  end

  defp parse_event_input(data) do
    data
    |> Map.merge(make_recurrence(data[:recurrence]) || %{})
    |> Map.reject(&(elem(&1, 0) == :recurrence))
  end

  defp get_recurrence(%CalendarEvent{recurrence_frequency: nil}), do: nil

  defp get_recurrence(%CalendarEvent{} = event) do
    %{
      frequency: event.recurrence_frequency,
      interval: event.recurrence_interval,
      days_of_week: event.recurrence_byday,
      days_of_month: event.recurrence_bymonthday,
      until: event.recurrence_until,
      occurrences: event.recurrence_count
    }
  end

  defp make_recurrence(
         %{
           frequency: frequency
         } = recurrence
       ) do
    %{
      recurrence_frequency: frequency,
      recurrence_interval: Map.get(recurrence, :interval),
      recurrence_byday: Map.get(recurrence, :days_of_week),
      recurrence_bymonthday: Map.get(recurrence, :days_of_month),
      recurrence_until: Map.get(recurrence, :until),
      recurrence_count: Map.get(recurrence, :occurrences)
    }
  end

  defp make_recurrence(nil), do: nil
end
