defmodule LottaWeb.Schema.Calendar do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :calendar_queries do
    field :external_calendar_events, list_of(:external_calendar_event) do
      arg(:url, non_null(:string))
      arg(:days, :integer)
      resolve(&LottaWeb.CalendarResolver.get_external/2)
    end

    field :calendars, list_of(:calendar) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      resolve(&LottaWeb.CalendarResolver.list/2)
    end
  end

  object :calendar_mutations do
    field :create_calendar, :calendar do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:name, non_null(:string))
      arg(:default_color, :string)

      resolve(&LottaWeb.CalendarResolver.create/2)
    end
  end

  object :calendar do
    field :id, :id
    field :name, :string
    field :default_color, :string

    field :events, list_of(:calendar_event),
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Calendar)
  end

  object :calendar_event do
    field :id, :id
    field :summary, non_null(:string)
    field :description, :string
    field :start, non_null(:datetime)
    field :end, non_null(:datetime)
    field :is_full_day, non_null(:boolean)
    field :repetition_rule, :string
  end

  object :external_calendar_event do
    field :uid, :string
    field :description, :string
    field :summary, :string
    field :start, :datetime
    field :end, :datetime
  end
end
