defmodule ApiWeb.Schema.Types.LottaId do
  @moduledoc """
  The LottaId scalar type allows integer ID values
  """
  use Absinthe.Schema.Notation
  
  scalar :lotta_id do
    parse &parse_id/1
    serialize &(&1)
  end
      
  @spec parse_id(Absinthe.Blueprint.Input.String.t()) :: {:ok, Integer.t()} | :error
  @spec parse_id(Absinthe.Blueprint.Input.Null.t()) :: {:ok, nil}
  defp parse_id(%Absinthe.Blueprint.Input.String{value: value}) do
    case Integer.parse(value) do
      {:ok, int} -> {:ok, int}
      _error -> :error
    end
  end

  @spec parse_id(Absinthe.Blueprint.Input.Integer.t()) :: {:ok, Integer.t()}
  @spec parse_id(Absinthe.Blueprint.Input.Null.t()) :: {:ok, nil}
  defp parse_id(%Absinthe.Blueprint.Input.Integer{value: value}) do
    {:ok, value}
  end

  defp parse_id(%Absinthe.Blueprint.Input.Null{}) do
    {:ok, nil}
  end

  defp parse_id(_) do
    :error
  end
end