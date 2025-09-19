defmodule LottaWeb.TenantController do
  use LottaWeb, :controller

  import Plug.Conn

  import Ecto.Query

  alias Lotta.Analytics
  alias Lotta.{Tenants, Repo}
  alias Lotta.Accounts.User
  alias Lotta.Tenants.Tenant

  action_fallback(LottaWeb.FallbackController)

  def create_test(conn, %{
        "tenant" => %{
          "title" => title,
          "slug" => slug
        },
        "user" => %{
          "name" => name,
          "email" => email
        }
      }) do
    tenant = %Tenant{title: title, slug: slug}
    user = %User{name: name, email: email}

    with {:ok, tenant} <- Tenants.create_tenant(tenant, user) do
      conn
      |> render(:created, tenant: tenant)
    end
  end

  def delete_tenant(conn, %{"tenant" => %{"id" => tenant_id}})
      when is_integer(tenant_id) or is_binary(tenant_id) do
    case Tenants.get_tenant(tenant_id) do
      nil ->
        {:error, :not_found}

      tenant ->
        with :ok <- Analytics.delete_site(tenant),
             {:ok, tenant} <- Tenants.delete_tenant(tenant) do
          conn
          |> render(:deleted, tenant: tenant)
        end
    end
  end

  def delete_tenant(_conn, %{"tenant" => _tenant_params}) do
    {:error, :bad_request}
  end

  def delete_tenant(_conn, _params) do
    {:error, :bad_request}
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
end
