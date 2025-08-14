defmodule Lotta.Services.ScheduleProvider do
  @moduledoc """
  HTTP Client to get schedule data
  """

  @spec client(
          type :: String.t(),
          username :: String.t(),
          password :: String.t(),
          school_id :: String.t()
        ) :: Tesla.Client.t()
  def client(type, username, password, school_id) do
    middleware = [
      {Tesla.Middleware.BaseUrl, Application.fetch_env!(:lotta, :schedule_provider_url)},
      {Tesla.Middleware.Query,
       [source: type, schoolId: school_id, username: username, password: password]},
      Tesla.Middleware.JSON
    ]

    Lotta.Tesla.create_client(middleware)
  end

  @spec get_schedule(
          client :: Tesla.Client.t(),
          class :: String.t(),
          date :: Date.t() | nil
        ) :: any()
  @doc """
  Get the preconfigured client for fetching a given user info's schedule
  """
  def get_schedule(
        client,
        class,
        date \\ nil
      ) do
    Tesla.get(client, "/schedule.json", query: get_query_params(class, date))
  end

  defp get_query_params(class), do: get_query_params(class, nil)

  defp get_query_params(class, nil), do: [class: class]

  defp get_query_params(class, date),
    do: Keyword.put(get_query_params(class), :date, Date.to_iso8601(date, :basic))
end
