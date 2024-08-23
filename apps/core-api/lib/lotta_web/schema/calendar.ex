defmodule LottaWeb.Schema.Calendar do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :calendar_queries do
    field(:external_calendar_events, non_null(list_of(non_null(:external_calendar_event)))) do
      arg(:url, non_null(:string))
      arg(:days, :integer)
      resolve(&LottaWeb.CalendarResolver.get_external/2)
    end

    field(:calendar_events, non_null(list_of(non_null(:calendar_event)))) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:calendar_id, non_null(:id))
      arg(:from, non_null(:datetime))
      arg(:latest, :datetime)
      arg(:limit, :integer)

      resolve(&LottaWeb.CalendarResolver.list_calendar_events/2)
    end

    field(:calendars, non_null(list_of(non_null(:calendar)))) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      resolve(&LottaWeb.CalendarResolver.list/2)
    end
  end

  object :calendar_mutations do
    field(:create_calendar, non_null(:calendar)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:name, non_null(:string))
      arg(:default_color, :string)

      resolve(&LottaWeb.CalendarResolver.create/2)
    end

    field(:create_calendar_event, non_null(:calendar_event)) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:calendar_id, non_null(:id))

      arg(:summary, non_null(:string))
      arg(:description, :string)

      arg(:start, non_null(:datetime))
      arg(:end, non_null(:datetime))
      arg(:is_full_day, :boolean)

      arg(:recurrence, :recurrence_input)

      resolve(&LottaWeb.CalendarResolver.create_event/2)
    end
  end

  input_object :recurrence_input do
    field(:frequency, non_null(:calendar_event_recurrence_frequency))
    field(:interval, non_null(:integer))
    field(:days_of_week, list_of(non_null(:string)))
    field(:days_of_month, list_of(non_null(:integer)))
    field(:until, :datetime)
    field(:occurrences, :integer)
  end

  object :calendar do
    field(:id, non_null(:id))
    field(:name, non_null(:string))
    field(:default_color, :string)

    field(:events, non_null(list_of(non_null(:calendar_event))),
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Calendar)
    )
  end

  object :calendar_event do
    field(:id, :id)
    field(:summary, non_null(:string))
    field(:description, :string)
    field(:start, non_null(:datetime))
    field(:end, non_null(:datetime))
    field(:is_full_day, non_null(:boolean))
    field(:recurrence, :calendar_event_recurrence)

    field(:calendar, non_null(:calendar),
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Calendar)
    )
  end

  object :calendar_event_recurrence do
    field(:frequency, :calendar_event_recurrence_frequency)
    field(:interval, :integer)
    field(:days_of_week, list_of(:string))
    field(:days_of_month, list_of(:integer))
    field(:until, :datetime)
    field(:occurrences, :integer)
  end

  object :external_calendar_event do
    field(:uid, :string)
    field(:description, :string)
    field(:summary, :string)
    field(:start, :datetime)
    field(:end, :datetime)
  end

  enum :calendar_event_recurrence_frequency do
    value(:daily, as: "daily")
    value(:weekly, as: "weekly")
    value(:monthly, as: "monthly")
    value(:yearly, as: "yearly")
  end
end
