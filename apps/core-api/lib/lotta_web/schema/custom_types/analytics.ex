defmodule LottaWeb.Schema.CustomTypes.Analytics do
  @moduledoc false

  use Absinthe.Schema.Notation

  @desc """
  The `AnalyticsPeriod` scalar type is a description of a period of time
  """
  scalar :analytics_period, name: "AnalyticsPeriod" do
    serialize(&Atom.to_string/1)
    parse(&parse_analytics_period/1)
  end

  @spec parse_analytics_period(Absinthe.Blueprint.Input.String.t()) ::
          {:ok, :month | :date} | :error
  @spec parse_analytics_period(Absinthe.Blueprint.Input.Null.t()) :: {:ok, nil}
  defp parse_analytics_period(%Absinthe.Blueprint.Input.String{value: value}) do
    case String.to_existing_atom(value) do
      period when period in [:date, :month] -> {:ok, period}
      _ -> :error
    end
  rescue
    ArgumentError -> :error
  end
end
