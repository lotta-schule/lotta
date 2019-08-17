defmodule ApiWeb.Schema.Types.LottaId do
  @moduledoc """
  The LottaId scalar type allows integer ID values
  """
  use Absinthe.Schema.Notation

    scalar :lotta_id do
        parse fn input ->
            if is_integer(input.value) do
                {:ok, input.value}
            else
                IO.inspect(input)
                case Integer.parse(input.value) do
                {n, _} ->
                    {:ok, n}
                :error ->
                    :error
                end
            end
        end
        serialize &(&1)
    end
end