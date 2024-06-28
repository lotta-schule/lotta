defmodule LottaWeb.ScheduleResolver do
  @moduledoc """
    GraphQL Resolver for requesting parsed schedule and timeline data for a given class.
    Is routed to schedule-provider microservice.
  """

  alias LottaWeb.Context
  alias Lotta.Tenants
  alias Lotta.Services.ScheduleProvider

  def get(%{widget_id: widget_id} = args, %{context: %Context{current_user: %{class: class}}}) do
    widget = Tenants.get_widget(widget_id)

    case widget.configuration do
      %{"username" => username, "password" => password, "schoolId" => school_id, "type" => type} ->
        ScheduleProvider.client(type, username, password, school_id)
        |> ScheduleProvider.get_schedule(class, args[:date])
        |> case do
          {:ok, %{status: 200} = response} ->
            {:ok, response.body}

          {_, _response} ->
            {:error, "Ungültige Daten"}
        end

      _ ->
        {:error, "Die Marginale ist unvollständig konfiguriert"}
    end
  end

  def get(%{widget_id: _}, %{context: %Context{current_user: user}}) when not is_nil(user) do
    {:error, "Du hast keine Klasse eingestellt"}
  end

  def get(_args, _info) do
    {:error, "Du bist nicht angemeldet"}
  end
end
