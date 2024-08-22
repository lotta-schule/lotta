defmodule Lotta.Calendar do
  @moduledoc """
    This module provides functions to interact with the calendar functionality of lotta.
  """

  alias Lotta.Calendar.{Calendar, CalendarEvent}
  alias Lotta.Repo

  @spec list_calendars() :: list(Calendar.t())
  def list_calendars() do
    Repo.all(Calendar)
  end

  @spec get_calendar(id :: Calendar.id()) :: Calendar.t() | nil
  def get_calendar(id), do: Repo.get(Calendar, id)

  @spec create_calendar(data :: map()) ::
          {:ok, Calendar} | {:error, Ecto.Changeset.t(Calendar.t())}
  def create_calendar(data) do
    data
    |> Calendar.create_changeset()
    |> Repo.insert()
  end

  @spec list_calendar_events(Calendar.t()) :: list(CalendarEvent.t())
  def list_calendar_events(calendar) do
    calendar
    |> Ecto.assoc(:events)
    |> Repo.all()
  end

  @spec create_event(map()) :: CalendarEvent.t()
  def create_event(args) do
    CalendarEvent.create_changeset(args)
    |> Repo.insert(prefix: Repo.get_prefix())
  end

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2, repo_opts: [prefix: Repo.get_prefix()])
  end

  def query(queryable, params) do
    queryable
  end
end
