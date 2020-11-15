defmodule Api.ScheduleResolver do
  @moduledoc """
    GraphQL Resolver for requesting parsed schedule and timeline data for a given class.
    Is routed to schedule-provider microservice.
  """

  alias Api.System

  def get(%{widget_id: widget_id} = args, %{context: %{current_user: %{class: class}}}) do
    widget = System.get_widget!(widget_id)
    base_url = Application.fetch_env!(:api, :schedule_provider_url)

    case widget.configuration do
      %{"username" => username, "password" => password, "schoolId" => school_id, "type" => type} ->
        query_params = %{
          class: class,
          source: type,
          schoolId: school_id,
          username: username,
          password: password
        }

        url = "#{base_url}/schedule.json?#{URI.encode_query(query_params)}"

        url =
          case args[:date] do
            nil ->
              url

            date ->
              "#{url}&date=#{Date.to_iso8601(date, :basic)}"
          end

        case :hackney.request(:get, url, [{<<"Accept-Charset">>, <<"utf-8">>}]) do
          {:ok, 200, _headers, client_ref} ->
            :hackney.request(:get, url, [{<<"Accept-Charset">>, <<"utf-8">>}])
            {:ok, body} = :hackney.body(client_ref)
            {:ok, Poison.decode!(body)}

          {:ok, 400, _headers, _client_ref} ->
            {:error, "Ungültige Daten"}

          error ->
            error
        end

      _ ->
        {:error, "Die Marginale ist unvollständig konfiguriert"}
    end
  end

  def get(%{widget_id: _}, %{context: %{current_user: _}}) do
    {:error, "Du hast keine Klasse eingestellt"}
  end

  def get(_args, _info) do
    {:error, "Du bist nicht angemeldet"}
  end
end
