defmodule Api.CalendarResolver do
  def get(%{url: url}, _info) do
    case :hackney.request(:get, url, [{<<"Accept-Charset">>, <<"utf-8">>}]) do
      {:ok, 200, _headers, clientRef} ->
        {:ok, body} = :hackney.body(clientRef)
        {:ok, body
          |> to_string
          |> ExIcal.parse
          |> ExIcal.by_range(
            DateTime.utc_now() |> DateTime.add(-60 * 60 * 24, :second),
            DateTime.utc_now() |> Timex.shift(days: 120)
          )
       }
      error ->
        error
    end
  end
end