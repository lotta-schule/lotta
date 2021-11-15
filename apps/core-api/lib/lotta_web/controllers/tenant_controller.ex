defmodule LottaWeb.TenantController do
  use LottaWeb, :controller

  alias Ecto.Changeset
  alias Lotta.Tenants

  def create_test(conn, %{"tenant" => tenant_params, "user" => user_params}) do
    tenant_params = atomize_keys(tenant_params)
    user_params = atomize_keys(user_params)

    case Tenants.create_tenant(user_params: user_params, tenant: tenant_params) do
      {:ok, _tenant} ->
        send_resp(conn, :ok, Jason.encode!(%{success: true}))

      {:error, _phase, %Changeset{} = changeset} ->
        send_resp(
          conn,
          :bad_request,
          Jason.encode!(%{error: LottaWeb.ErrorHelpers.extract_error_details(changeset)})
        )

      {:error, _phase, reason} ->
        send_resp(conn, :internal_server_error, Jason.encode!(inspect(reason)))
    end
  end

  defp atomize_keys(map) do
    Enum.reduce(map, %{}, fn
      {key, val}, acc when is_atom(key) ->
        Map.put(acc, key, val)

      {key, val}, acc ->
        Map.put(acc, String.to_atom(key), val)
    end)
  end
end
