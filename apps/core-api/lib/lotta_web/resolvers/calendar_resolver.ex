defmodule LottaWeb.CalendarResolver do
  @moduledoc false

  require Logger

  def get(%{url: url} = args, _info) do
    result_body =
      ConCache.fetch_or_store(:http_cache, url, fn ->
        case :hackney.request(:get, url, [{<<"Accept-Charset">>, <<"utf-8">>}]) do
          {:ok, 200, _headers, client_ref} ->
            {:ok, body} = :hackney.body(client_ref)
            {:ok, %ConCache.Item{value: to_string(body), ttl: :timer.hours(6)}}

          {:ok, status, _headers, _client_ref} ->
            {:error, "Calendar Error #{status}"}

          error ->
            Logger.error(error)
            {:error, :unknown_error}
        end
      end)

    case result_body do
      {:ok, body} ->
        try do
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
        rescue
          e ->
            Logger.error(e)
            {:error, :invalid_calendar_format}
        end

      error ->
        error
    end
  end
end
