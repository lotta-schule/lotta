defmodule Api.CalendarResolver do
  def get(%{url: url}, _info) do
    {:ok, {{_http, 200, 'OK'}, _headers, body}} = :httpc.request(:get, {to_charlist(url), []}, [], [])
    {:ok, body |> to_string |> ExIcal.parse |> ExIcal.by_range(DateTime.utc_now(), DateTime.utc_now() |> Timex.shift(days: 120))}
  end
end