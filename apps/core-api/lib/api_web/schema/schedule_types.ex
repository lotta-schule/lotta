defmodule ApiWeb.Schema.ScheduleTypes do
  use Absinthe.Schema.Notation
  
  object :schedule_queries do
    field :schedule, :json do
      arg :widget_id, non_null(:lotta_id)
      arg :date, :date
      resolve &Api.ScheduleResolver.get/2
    end
  end
end