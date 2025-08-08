defmodule LottaWeb.TenantController do
  use LottaWeb, :controller

  import Plug.Conn

  import Ecto.Query

  alias Lotta.{Tenants, Repo}
  alias Lotta.Accounts.User

  action_fallback(LottaWeb.FallbackController)

  def create_test(conn, %{"tenant" => tenant_params, "user" => user_params}) do
    tenant_params = atomize_keys(tenant_params)
    user_params = atomize_keys(user_params)

    with {:ok, tenant} <-
           IO.inspect(Tenants.create_tenant(user_params: user_params, tenant: tenant_params)) do
      conn
      |> render(:created, tenant: tenant)
    end
  end

  def delete_tenant(conn, %{"tenant" => %{"id" => tenant_id}}) do
    tenant = Tenants.get_tenant(tenant_id)

    with {:ok, tenant} <- Tenants.delete_tenant(tenant) do
      conn
      |> render(:deleted, tenant: tenant)
    end
  end

  def list_user_tenants(conn, args) do
    username = Map.get(args, "username", "")

    tenants =
      Tenants.list_tenants()
      |> Enum.filter(fn %{prefix: prefix} ->
        Repo.exists?(
          from(u in User,
            where: u.email == ^username
          ),
          prefix: prefix
        )
      end)

    conn
    |> render(:list, tenants: tenants)
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
