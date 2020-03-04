defmodule ApiWeb.Schema.CalendarTypes do
  use Absinthe.Schema.Notation

  object :calendar_queries do
    field :calendar, list_of(:calendar_event) do
      arg :url, non_null(:string)
      arg :days, :integer
      resolve &Api.CalendarResolver.get/2
    end
  end
  
  object :calendar_event do
    field :uid, :string
    field :description, :string
    field :summary, :string
    field :start, :naive_datetime
    field :end, :naive_datetime
  end
end