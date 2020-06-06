defmodule Api.CalendarResolver do
  def get(%{url: url} = args, _info) do
    result_body =
      ConCache.fetch_or_store(:http_cache, url, fn ->
        case :hackney.request(:get, url, [{<<"Accept-Charset">>, <<"utf-8">>}]) do
          {:ok, 200, _headers, clientRef} ->
            {:ok, body} = :hackney.body(clientRef)
            {:ok, %ConCache.Item{value: to_string(body), ttl: :timer.hours(6)}}

          error ->
            error
        end
      end)

    case result_body do
      {:ok, body} ->
        ical =
          body
          |> ExIcal.parse()
          |> ExIcal.by_range(
            DateTime.utc_now() |> DateTime.add(-60 * 60 * 24, :second),
            DateTime.utc_now() |> Timex.shift(days: args[:days] || 90)
          )

        {:ok, ical}

      error ->
        error
    end
  end
end
