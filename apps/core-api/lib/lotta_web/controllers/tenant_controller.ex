defmodule LottaWeb.TenantController do
  use LottaWeb, :controller

  import Plug.Conn

  import Ecto.Query
  import Absinthe.Utils, only: [camelize: 2]

  alias Ecto.Changeset
  alias Lotta.{Tenants, Repo}
  alias Lotta.Accounts.User

  def create_test(conn, %{"tenant" => tenant_params, "user" => user_params}) do
    tenant_params = atomize_keys(tenant_params)
    user_params = atomize_keys(user_params)

    case Tenants.create_tenant(user_params: user_params, tenant: tenant_params) do
      {:ok, tenant} ->
        send_resp(
          conn,
          :ok,
          Jason.encode!(%{
            success: true,
            tenant: %{
              id: tenant.id,
              slug: tenant.slug,
              title: tenant.title,
              inserted_at: tenant.inserted_at,
              updated_at: tenant.updated_at
            }
          })
        )

      {:error, %Changeset{} = changeset} ->
        send_resp(
          conn,
          :bad_request,
          Jason.encode!(%{error: LottaWeb.ErrorHelpers.extract_error_details(changeset)})
        )

      {:error, reason} ->
        send_resp(conn, :internal_server_error, Jason.encode!(inspect(reason)))
    end
  end

  def delete_tenant(conn, %{"tenant" => %{"id" => tenant_id}}) do
    tenant = Tenants.get_tenant(tenant_id)

    case Tenants.delete_tenant(tenant) do
      {:ok, _tenant} ->
        send_resp(conn, :ok, Jason.encode!(%{success: true}))

      other ->
        send_resp(conn, :internal_server_error, Jason.encode!(other))
    end
  end

  def list_user_tenants(conn, args) do
    username = Map.get(args, "username", "")

    Tenants.list_tenants()
    |> Enum.filter(fn %{prefix: prefix} ->
      from(u in User,
        where: u.email == ^username
      )
      |> Repo.exists?(prefix: prefix)
    end)
    |> Enum.map(fn tenant ->
      tenant
      |> Map.keys()
      |> Enum.reduce(%{}, fn
        key, acc
        when key in [:id, :slug, :title, :logo_image_file_id, :background_image_file_id] ->
          Map.put(acc, camelize(to_string(key), lower: true), Map.get(tenant, key))

        _, acc ->
          acc
      end)
    end)
    |> then(fn tenants ->
      json(conn, %{
        success: true,
        tenants: tenants
      })
    end)
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
