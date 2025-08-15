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

  def delete_tenant(conn, %{"tenant" => %{"id" => tenant_id}}) do
    tenant = Tenants.get_tenant(tenant_id)

    with :ok <- Analytics.delete_site(tenant),
         {:ok, tenant} <- Tenants.delete_tenant(tenant) do
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
end
