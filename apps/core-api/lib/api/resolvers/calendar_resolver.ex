defmodule Api.CalendarResolver do
  def get(%{url: url}, _info) do
    {:ok, 200, _headers, clientRef} = :hackney.request(:get, url, [{<<"Accept-Charset">>, <<"utf-8">>}])
    {:ok, body} = :hackney.body(clientRef)
    {:ok, body |> to_string |> ExIcal.parse |> ExIcal.by_range(DateTime.utc_now(), DateTime.utc_now() |> Timex.shift(days: 120))}
  end
end