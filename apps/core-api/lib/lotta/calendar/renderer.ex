defmodule Lotta.Calendar.Renderer do
  @moduledoc """
  This module is responible to render an ical compatible string
  for an event.
  """

  alias Lotta.Calendar.{Calendar, CalendarEvent}

  def to_ics(%CalendarEvent{} = event) do
    calendar_event do
      """
      DTSTART#{render_date_or_dt(event, :start)}
      DTEND#{render_date_or_dt(event, :end)}
      LOCATION:#{event.location_name}
      SUMMARY;LANGUAGE=DE:#{event.summary}
      UID:#{event.calendar_id}-#{event.id}
      DTSTAMP:#{to_ics_date(event.updated_at)}
      CLASS:PUBLIC
      """
      |> String.trim()
      |> maybe_append("DESCRIPTION;LANGUAGE=DE", event.description, glue_char: ":")
      |> maybe_append("RRULE", render_rrule(event), glue_char: ":")
    end
  end

  def to_ics(%Calendar{} = calendar) do
    calendar do
      """
      VERSION:2.0
      METHOD:PUBLISH
      CALSCALE:GREGORIAN
      REFRESH-INTERVAL;VALUE=DURATION:PT6H
      PRODID:-//einsa Gbr//Lotta//DE
      X-WR-CALNAME:#{calendar.name}
      NAME:#{calendar.name}
      COLOR:#{calendar.color}
      DTSTAMP:#{to_ics_date(calendar.updated_at)}
      #{Enum.map_join(calendar.events, "\n", &to_ics/1)}
      """
    end
  end

  defp entity(name, do: block) do
    """
    BEGIN:#{name}
    #{block}
    END:#{name}
    """
  end

  defp entity(name, block), do: entity(name, do: block)

  defp calendar(do: block), do: entity("VCALENDAR", block)
  defp calendar_event(do: block), do: entity("VEVENT", block)

  defp string_val(value) when is_list(value), do: Enum.join(value, ",")
  defp string_val(value) when is_struct(DateTime), do: to_ics_date(value)
  defp string_val(value), do: to_string(value)

  defp maybe_append(acc, field, value, opts \\ [])
  defp maybe_append(acc, _f, nil, _opts), do: acc
  defp maybe_append(acc, _f, "", _opts), do: acc
  defp maybe_append(acc, _f, [], _opts), do: acc

  defp maybe_append(acc, field, value, opts),
    do:
      acc <> (opts[:init_char] || "\n") <> field <> (opts[:glue_char] || "=") <> string_val(value)

  defp render_rrule(%CalendarEvent{} = event) do
    case event.recurrence_frequency do
      nil ->
        ""

      frequency ->
        "FREQ=#{String.upcase(frequency)}"
        |> maybe_append("INTERVAL", event.recurrence_interval, init_char: ";")
        |> maybe_append("BYDAY", event.recurrence_byday, init_char: ";")
        |> maybe_append("BYMONTHDAY", event.recurrence_bymonthday, init_char: ";")
        |> maybe_append("UNTIL", event.recurrence_until, init_char: ";")
        |> maybe_append("COUNT", event.recurrence_count, init_char: ";")
    end
  end

  defp to_ics_date(date) do
    date
    |> DateTime.to_iso8601()
    |> String.replace(~r/-|:/, "")
  end

  defp render_date_or_dt(%{is_full_day: true} = event, property_name) do
    ";VALUE=DATE:" <>
      (event
       |> Map.fetch!(property_name)
       |> DateTime.to_iso8601()
       |> String.replace(~r/-|/, "")
       |> String.replace(~r/T.*/, ""))
  end

  defp render_date_or_dt(event, property_name),
    do:
      ":" <>
        (event
         |> Map.fetch!(property_name)
         |> to_ics_date())
end
