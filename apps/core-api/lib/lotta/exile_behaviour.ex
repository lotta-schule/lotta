defmodule Lotta.ExileBehaviour do
  @callback stream!([String.t()], keyword()) :: Enumerable.t()
end
