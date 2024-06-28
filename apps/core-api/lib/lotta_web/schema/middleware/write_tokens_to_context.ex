defmodule LottaWeb.Schema.Middleware.WriteTokensToContext do
  @moduledoc false

  @behaviour Absinthe.Middleware

  @doc false

  def call(%{value: %{refresh_token: token}} = resolution, _) do
    resolution
    |> Map.update!(:context, &Map.put(&1, :refresh_token, token))
  end

  def call(resolution, _), do: resolution
end
