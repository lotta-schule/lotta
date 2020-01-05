defmodule Api.ScheduleResolver do
  alias Api.Tenants

  def get(%{widget_id: widget_id} = args, %{context: %{current_user: %{class: class}}}) do
    widget = Tenants.get_widget!(widget_id)
    base_url = Application.fetch_env!(:api, :schedule_provider_url)
    case widget.configuration do
      %{"username" => username, "password" => password, "schoolId" => schoolId, "type" => type} ->
        url = "#{base_url}/schedule.json?class=#{class}&source=#{type}&schoolId=#{schoolId}&username=#{username}&password=#{password}"
        url = case args[:date] do
          nil ->
            url
          date ->
            "#{url}&date=#{Date.to_iso8601(date, :basic)}"
        end
        IO.inspect(url)
        case :hackney.request(:get, url, [{<<"Accept-Charset">>, <<"utf-8">>}]) do
          {:ok, 200, _headers, clientRef} ->
            :hackney.request(:get, url, [{<<"Accept-Charset">>, <<"utf-8">>}])
            {:ok, body} = :hackney.body(clientRef)
            {:ok, Poison.decode!(body)}
          {:ok, 400, _headers, _clientRef} ->
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