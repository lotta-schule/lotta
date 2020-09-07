defmodule ApiWeb.Schema.Middleware.WriteTokensToContext do
  @moduledoc """
  Looks for "value: token: " in the absinthe response and writes it into context.
  This is so we can later extract it from context and write it to cookie,
  as we do not have access to the conn object in the Absinthe pipeline.
  """
  @behaviour Absinthe.Middleware

  @doc false

  def call(%{value: %{refresh_token: token}} = resolution, _) do
    resolution
    |> Map.update!(:context, &Map.put(&1, :refresh_token, token))
  end

  def call(resolution, _), do: resolution
end
