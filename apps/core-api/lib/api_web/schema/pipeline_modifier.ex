defmodule ApiWeb.Schema.PipelineModifier do
  @moduledoc """
  This is a custom configuration for the [absinthe schema pipeline](https://hexdocs.pm/absinthe/Absinthe.Schema.html) that should omit the variable type check in the test environment.
  It seems ConnCase does not recognize Int values vary well and always encodes them as String.
  """
  alias Absinthe.{Phase, Pipeline}

  def pipeline(pipeline) do
    IO.inspect(pipeline)

    pipeline
    |> Pipeline.without(Phase.Validation)
  end

  def run(blueprint, _) do
    {:ok, blueprint}
  end
end
