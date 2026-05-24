defmodule LottaWeb.Schema.Middleware.WriteTokensToContext do
  @moduledoc false

  @behaviour Absinthe.Middleware

  @doc false

  def call(%{value: %{} = value} = resolution, _) do
    context =
      [:refresh_token, :access_token]
      |> Enum.reduce(resolution.context, fn key, ctx ->
        case Map.fetch(value, key) do
          {:ok, token} -> Map.put(ctx, key, token)
          :error -> ctx
        end
      end)

    %{resolution | context: context}
  end

  def call(resolution, _), do: resolution
end
