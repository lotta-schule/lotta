defmodule ApiWeb.Schema.Middleware.EnsureUserIsAdministrator do
  @moduledoc false

  @behaviour Absinthe.Middleware

  @doc false

  def call(%{context: %{is_admin: true}} = resolution, _config), do: resolution

  def call(resolution, _config) do
    resolution
    |> Absinthe.Resolution.put_result({:error, "Du musst Administrator sein um das zu tun."})
  end
end
