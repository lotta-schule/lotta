defmodule Lotta.Calendar do
  alias Lotta.Calendar.{Calendar, CalendarEvent}
  alias Lotta.Repo

  @spec list_calendars() :: list(Calendar)
  def list_calendars() do
    Repo.all(Calendar)
  end

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

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2, repo_opts: [prefix: Repo.get_prefix()])
  end

  def query(queryable, params) do
    IO.inspect(queryable)
    IO.inspect(params)
    queryable
  end
end
