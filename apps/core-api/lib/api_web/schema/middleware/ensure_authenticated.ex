defmodule ApiWeb.Schema.Middleware.EnsureAuthenticated do
  @moduledoc false

  @behaviour Absinthe.Middleware

  @doc false

  def call(%{context: %{current_user: %{id: _id}}} = resolution, _) do
    resolution
  end

  def call(resolution, _) do
    resolution
    |> Absinthe.Resolution.put_result({:error, "Du musst angemeldet sein um das zu tun."})
  end
end
