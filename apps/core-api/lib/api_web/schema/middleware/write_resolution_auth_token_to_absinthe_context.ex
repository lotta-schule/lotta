defmodule ApiWeb.Schema.Middleware.WriteResolutionAuthTokenToAbsintheContext do
  @moduledoc """
  Looks for "value: token: " in the absinthe response and writes it into context.
  This is because Absinthe has no direct cookie support
  """

  @behaviour Absinthe.Middleware

  def call(%{value: %{token: token}} = resolution, _) do
    resolution
    |> Map.update!(:context, &Map.put(&1, :auth_token, token))
  end

  def call(resolution, _), do: resolution
end
