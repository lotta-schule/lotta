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
    |> put_tenant(conn)
    |> put_user(conn)
  end

  defp put_user(context, conn) do
    conn = conn
      |> Plug.Conn.fetch_cookies()
    authorization_header = get_req_header(conn, "authorization")
    authorization_token = with ["Bearer " <> token] <- authorization_header do
      token
    else
      _ ->
        conn.cookies["LottaAuth"]
    end
    tenant = context[:tenant]
    with false <- is_nil(authorization_token),
        {:ok, current_user, _claims} <- Guardian.resource_from_token(authorization_token),
        true <- !tenant || !Accounts.User.is_blocked?(current_user, tenant) do
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
    tenant = tenant_by_slug_header(conn) || tenant_by_origin_header(conn)
    if !is_nil(tenant), do: Map.put(context, :tenant, tenant), else: context
  end

  defp tenant_by_slug_header(conn) do
    with ["slug:" <> slug] <- get_req_header(conn, "tenant") do
      Tenants.get_tenant_by_slug(slug)
    else
      _ ->
        nil
    end
  end
  
  defp tenant_by_origin_header(conn) do
    case get_req_header(conn, "origin") do
      [origin] ->
        Tenants.get_tenant_by_origin(origin)
      _ ->
        nil
    end
  end
end