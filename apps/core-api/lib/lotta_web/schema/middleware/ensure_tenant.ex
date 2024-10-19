defmodule LottaWeb.Schema.Middleware.EnsureTenant do
  @moduledoc false

  @behaviour Absinthe.Middleware

  alias Lotta.Tenants.Tenant

  @doc false

  def call(
        %{context: %{tenant: %Tenant{id: _id}}} = resolution,
        _config
      ),
      do: resolution

  def call(resolution, _config) do
    resolution
    |> Absinthe.Resolution.put_result({:error, "Lotta nicht gefunden."})
  end
end
