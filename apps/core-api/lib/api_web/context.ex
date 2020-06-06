defmodule ApiWeb.Context do
  @moduledoc """
    Plug which builds a context for connections into the app.
    Will provide tenant and user account information
  """

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
    conn =
      conn
      |> Plug.Conn.fetch_cookies()

    authorization_header = get_req_header(conn, "authorization")

    authorization_token =
      case authorization_header do
        ["Bearer " <> token] ->
          token

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

      user_group_ids = Accounts.User.group_ids(current_user, tenant)
      user_is_admin = Accounts.User.is_admin?(current_user, tenant)

      Task.start_link(fn ->
        current_user
        |> Repo.preload(:tenant)
        |> Accounts.see_user()
      end)

      context
      |> Map.put(:current_user, current_user)
      |> Map.put(:user_group_ids, user_group_ids)
      |> Map.put(:user_is_admin, user_is_admin)
    else
      _ ->
        context
        |> Map.put(:user_group_ids, [])
        |> Map.put(:user_is_admin, false)
    end
  end

  defp put_tenant(context, conn) do
    tenant = tenant_by_slug_header(conn) || tenant_by_origin_header(conn)

    if is_nil(tenant) do
      context
    else
      Map.put(context, :tenant, tenant)
    end
  end

  defp tenant_by_slug_header(conn) do
    case get_req_header(conn, "tenant") do
      ["slug:" <> slug] ->
        Tenants.get_tenant_by_slug(slug)

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
