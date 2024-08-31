defmodule Lotta.Calendar do
  @moduledoc """
    This module provides functions to interact with the calendar functionality of lotta.
  """
  import Ecto.Query

  alias Lotta.Calendar.{Calendar, CalendarEvent}
  alias Lotta.Repo

  @doc """
  List all available calendars.
  """
  @doc since: "5.0.0"
  @spec list_calendars() :: list(Calendar.t())
  def list_calendars() do
    Repo.all(Calendar)
  end

  @doc """
  Get the calendar with a given id.
  """
  @doc since: "5.0.0"
  @spec get_calendar(id :: Calendar.id()) :: Calendar.t() | nil
  def get_calendar(id), do: Repo.get(Calendar, id, prefix: Repo.get_prefix())

  @doc """
  Get the calendar event with a given id.
  """
  @doc since: "5.0.0"
  @spec get_calendar_event(id :: CalendarEvent.id()) :: CalendarEvent.t() | nil
  def get_calendar_event(id), do: Repo.get(CalendarEvent, id, prefix: Repo.get_prefix())

  @spec create_calendar(data :: map()) ::
          {:ok, Calendar} | {:error, Ecto.Changeset.t(Calendar.t())}
  def create_calendar(data) do
    data
    |> Calendar.changeset()
    |> Repo.insert(prefix: Repo.get_prefix())
  end

  @spec update_calendar(Calendar.t(), data :: map()) ::
          {:ok, Calendar} | {:error, Ecto.Changeset.t(Calendar.t())}
  def update_calendar(calendar, data) do
    calendar
    |> Calendar.changeset(data)
    |> Repo.update()
  end

  @doc """
  List all events of a given calendar.
  Provide options to narrow down the list of events.
  """
  @doc since: "5.0.0"
  @spec list_calendar_events(
          Calendar.t(),
          options :: [{:from, DateTime}, {:latest, DateTime}, {:limit, pos_integer()}]
        ) :: list(CalendarEvent.t())
  def list_calendar_events(calendar, options \\ []) do
    calendar
    |> Ecto.assoc(:events)
    |> apply_event_list_options(options)
    |> Repo.all()
  end

  @doc """
  Create a new event for a given calendar.
  """
  @doc since: "5.0.0"
  @spec create_event(Calendar.t(), map()) ::
          {:ok, CalendarEvent.t()} | {:error, Ecto.Changeset.t(CalendarEvent.t())}
  def create_event(%{id: calendar_id} = calendar, args) do
    args
    |> Map.put(:calendar_id, calendar_id)
    |> CalendarEvent.changeset()
    |> Repo.insert(prefix: Ecto.get_meta(calendar, :prefix))
  end

  @doc """
  Update an event
  """
  @doc since: "5.0.0"
  @spec update_event(CalendarEvent.t(), data :: map()) ::
          {:ok, CalendarEvent.t()} | {:error, Ecto.Changeset.t(CalendarEvent.t())}
  def update_event(calendar, data) do
    calendar
    |> CalendarEvent.changeset(data)
    |> Repo.update()
  end

  @doc """
  Delete an event
  """
  @doc since: "5.0.0"
  @spec delete_event(CalendarEvent.t()) ::
          :ok | {:error, Ecto.Changeset.t(CalendarEvent.t())}
  def delete_event(calendar) do
    calendar
    |> Repo.delete()
    |> case do
      {:ok, _} -> :ok
      error -> error
    end
  end

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2)
  end

  defp apply_event_list_options(query, options) do
    Enum.reduce(options, query, fn
      {:from, from}, query -> apply_event_list_from(query, from)
      {:latest, latest}, query -> apply_event_list_latest(query, latest)
      {:limit, limit}, query -> apply_event_list_limit(query, limit)
    end)
  end

  defp apply_event_list_from(query, from) do
    from(ev in query,
      where: ev.start >= ^from or not is_nil(ev.recurrence_frequency)
    )
  end

  defp apply_event_list_latest(query, latest) do
    from(ev in query,
      where: ev.end <= ^latest or not is_nil(ev.recurrence_frequency)
    )
  end

  defp apply_event_list_limit(query, limit) do
    from(ev in query,
      limit: ^limit
    )
  end

  def query(queryable, _params) do
    queryable
  end
end
