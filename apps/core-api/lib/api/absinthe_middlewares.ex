defmodule Api.AbsintheMiddlewares do
  @moduledoc """
  Looks for "value: token: " in the absinthe response and writes it into context.
  This is because Absinthe has no direct cookie support
  """

  def set_user_token(resolution, _) do
    with %{value: %{token: token}} <- resolution do
      Map.update!(resolution, :context, fn ctx ->
        Map.put(ctx, :auth_token, token)
      end)
    end
  end
end
