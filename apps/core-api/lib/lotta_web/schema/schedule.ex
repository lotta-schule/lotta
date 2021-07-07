defmodule LottaWeb.Schema.Schedule do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :schedule_queries do
    field :schedule, :json do
      arg(:widget_id, non_null(:id))
      arg(:date, :date)
      resolve(&LottaWeb.ScheduleResolver.get/2)
    end
  end
end
