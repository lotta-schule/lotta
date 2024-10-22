defmodule LottaWeb.WidgetResolver do
  @moduledoc false

  import LottaWeb.ErrorHelpers

  alias LottaWeb.CalendarResolver
  alias Lotta.{Calendar, Tenants}

  def all(%{category_id: category_id}, %{
        context: %{current_user: current_user}
      }) do
    category = Tenants.get_category(category_id)

    if category do
      {:ok,
       Tenants.list_widgets_by_category(
         category,
         current_user
       )}
    else
      {:error, "Kategorie mit der id #{category_id} nicht gefunden."}
    end
  end

  def all(_args, %{context: %{current_user: current_user}}) do
    {:ok, Tenants.list_widgets(current_user)}
  end

  def create(args, _info) do
    args
    |> Tenants.create_widget()
    |> format_errors("Erstellen der Marginale fehlgeschlagen.")
  end

  def update(%{id: id, widget: widget_params}, _info) do
    case Tenants.get_widget(id) do
      nil ->
        {:error, "Marginale mit der id #{id} nicht gefunden."}

      widget ->
        widget
        |> Tenants.update_widget(widget_params)
        |> format_errors("Bearbeiten der Marginale fehlgeschlagen.")
    end
  end

  def delete(%{id: id}, _info) do
    widget = Tenants.get_widget(id)

    if widget do
      widget
      |> Tenants.delete_widget()
      |> format_errors("Löschen der Marginale fehlgeschlagen.")
    else
      {:error, "Marginale mit der id #{id} nicht gefunden."}
    end
  end

  def resolve_calendar_events(_args, %{source: %{configuration: %{"calendars" => calendars}}}) do
    calendars
    |> Enum.flat_map(fn
      %{"type" => "internal", "calendarId" => calendar_id} = config ->
        days =
          case Map.get(config, "days") do
            days when is_integer(days) and days > 0 and days < 370 -> days
            _ -> 180
          end

        case Calendar.get_calendar(calendar_id) do
          nil ->
            []

          calendar ->
            now = DateTime.utc_now()

            Calendar.list_calendar_events(calendar,
              from: now,
              latest: DateTime.add(now, days, :day)
            )
        end

      _ ->
        []
    end)
    |> Enum.map(&CalendarResolver.format_event/1)
    |> then(&{:ok, &1})
  end

  def resolve_calendar_events(_args, _info) do
    {:ok, nil}
  end
end
