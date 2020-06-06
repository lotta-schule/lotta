defmodule Api.AbsintheMiddlewares do
  def set_user_token(resolution, _) do
    with %{value: %{token: token}} <- resolution do
      Map.update!(resolution, :context, fn ctx ->
        Map.put(ctx, :auth_token, token)
      end)
    end
  end
end
