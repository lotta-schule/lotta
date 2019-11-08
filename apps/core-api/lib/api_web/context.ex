defmodule ApiWeb.Context do
  @behaviour Plug

  import Plug.Conn

  alias Api.{Guardian, Accounts, Tenants, Repo}

  def init(opts), do: opts

  def call(conn, _) do
    conn
    |> put_user_context
    |> put_tenant_context
  end

  defp put_user_context(conn) do
    authorization_header = get_req_header(conn, "authorization")
    with ["Bearer " <> token] <- authorization_header do
      case Guardian.resource_from_token(token) do
        {:ok, current_user, _claims} ->
          current_user = Repo.get(Accounts.User, current_user.id)
          |> Repo.preload([:groups, :avatar_image_file])
          Task.start_link(fn ->
            current_user
            |> Repo.preload(:tenant)
            |> Accounts.see_user()
          end)
          conn
          |> Absinthe.Plug.put_options(context: %{current_user: current_user})
        {:error, _} ->
          conn
      end
    else
      _ ->
        conn
    end
  end

  defp put_tenant_context(conn) do
    tenant_header = get_req_header(conn, "tenant")
    with ["slug:" <> slug] <- tenant_header do
      tenant = case Tenants.get_tenant_by_slug(slug) do
        nil -> Tenants.get_tenant_by_slug!("ehrenberg")
        tenant -> tenant
      end
      conn
      |> Absinthe.Plug.put_options(context: %{tenant: tenant})
    end
  end
end