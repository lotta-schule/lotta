defmodule ApiWeb.Schema.Middleware.WriteResolutionAuthTokenToAbsintheContext do
  @moduledoc """
  Looks for "value: token: " in the absinthe response and writes it into context.
  This is because Absinthe has no direct cookie support
  """
  alias Api.Accounts.User

  @behaviour Absinthe.Middleware

  def call(%{value: %{sign_in_user: %User{} = user}} = resolution, _) do
    resolution
    |> Map.update!(:context, &Map.put(&1, :sign_in_user, user))
  end

  def call(%{value: %{sign_out_user: true}} = resolution, _) do
    resolution
    |> Map.update!(:context, &Map.put(&1, :sign_out_user, true))
  end

  def call(resolution, _), do: resolution
end
