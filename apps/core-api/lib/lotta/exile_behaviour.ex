defmodule Lotta.ExileBehaviour do
  @moduledoc false
  @callback stream!([String.t()], keyword()) :: Enumerable.t()
end
