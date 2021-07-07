defmodule CockpitWeb.TenantController do
  use CockpitWeb, :controller

  alias Ecto.Changeset
  alias Lotta.Tenants
  alias Lotta.Tenants.Tenant

  def index(conn, _params) do
    tenants = Tenants.list_tenants()
    render(conn, "index.html", tenants: tenants)
  end

  def show(conn, %{"id" => id}) do
    tenant = Tenants.get_tenant(id)
    {:ok, usages} = Tenants.Usage.get_usage(tenant)
    render(conn, "show.html", tenant: tenant, usages: usages)
  end

  def new(conn, _params) do
    changeset = Tenant.create_changeset(%Tenant{}, %{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"tenant" => params}) do
    tenant_params = atomize_keys(Map.take(params, ["slug", "title"]))
    user_params = atomize_keys(Map.take(params, ["name", "email"]))

    case Tenants.create_tenant(user_params: user_params, tenant: tenant_params) do
      {:ok, tenant} ->
        redirect(conn, to: Routes.tenant_path(conn, :show, tenant))

      {:error, %Changeset{} = changeset, _phase} ->
        render(conn, "new.html", changeset: changeset)

      {:error, reason, _phase} ->
        conn
        |> put_flash(:error, "Leider hat das nicht geklappt: #{reason}")
        |> render("new.html", changeset: Tenant.create_changeset(%Tenant{}, %{}))
    end
  end

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
