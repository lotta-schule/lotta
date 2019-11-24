defmodule ApiWeb.Context do
  @behaviour Plug

  import Plug.Conn

  alias Api.{Guardian, Accounts, Tenants, Repo}

  def init(opts), do: opts

  def call(conn, _) do
    conn
    |> Absinthe.Plug.put_options(context: build_absinthe_context(conn))
  end

  def build_absinthe_context(conn, context \\ %{}) do
    context
    |> put_user(conn)
    |> put_tenant(conn)
  end

  defp put_user(context, conn) do
    authorization_header = get_req_header(conn, "authorization")
    with ["Bearer " <> token] <- authorization_header,
        {:ok, current_user, _claims} <- Guardian.resource_from_token(token) do
      current_user =
        Repo.get(Accounts.User, current_user.id)
        |> Repo.preload([:groups, :avatar_image_file])
      Task.start_link(fn ->
        current_user
        |> Repo.preload(:tenant)
        |> Accounts.see_user()
      end)
      Map.put(context, :current_user, current_user)
    else
      _ ->
        context
    end
  end

  defp put_tenant(context, conn) do
    tenant_header = get_req_header(conn, "tenant")
    with ["slug:" <> slug] <- tenant_header do
      tenant = case Tenants.get_tenant_by_slug(slug) do
        nil -> Tenants.get_tenant_by_slug!("ehrenberg")
        tenant -> tenant
      end
      context
      |> Map.put(:tenant, tenant)
    else
      _ ->
        context
    end
  end
end