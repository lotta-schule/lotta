defmodule ApiWeb.Context do
  @moduledoc """
    Plug which builds a context for connections into the app.
    Will provide tenant and user account information
  """

  @behaviour Plug

  require Logger

  import Plug.Conn
  import Api.Accounts.Authentication
  import Api.Accounts.Permissions

  alias Api.{Accounts, Tenants}
  alias Api.Accounts.User

  def init(opts), do: opts

  def call(conn, _blueprint) do
    context =
      %{}
      |> maybe_put_tenant(conn)
      |> maybe_put_user(conn)
      |> maybe_put_user_is_blocked(conn)

    conn
    |> Absinthe.Plug.put_options(context: context)
  end

  defp maybe_put_tenant(context, conn) do
    case tenant_by_slug_header(conn) || tenant_by_origin_header(conn) do
      tenant when not is_nil(tenant) ->
        Map.put(context, :tenant, tenant)

      nil ->
        context
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

  defp maybe_put_user(context, conn) do
    case ApiWeb.Auth.AccessToken.Plug.current_resource(conn) do
      user when not is_nil(user) ->
        if System.get_env("APP_ENVIRONMENT") != "test",
          do: Task.start_link(fn -> Accounts.see_user(user) end)

        context
        |> Map.put(:current_user, user)
        |> Map.put(
          :user_group_ids,
          if(tenant = context[:tenant], do: User.group_ids(user, tenant), else: [])
        )
        |> Map.put(
          :user_is_admin,
          if(tenant = context[:tenant], do: user_is_admin?(user, tenant), else: false)
        )

      nil ->
        context
        |> Map.put(:user_group_ids, [])
        |> Map.put(:user_is_admin, false)
    end
  end

  defp maybe_put_user_is_blocked(%{current_user: user, tenant: tenant} = context, _conn) do
    case ensure_user_is_not_blocked(user, tenant) do
      :ok ->
        context

      {:error, _} ->
        Logger.warn("User #{user.email} is blocked for tenant #{tenant.slug}.")

        context
        |> Map.put(:user_is_blocked, true)
    end
  end

  defp maybe_put_user_is_blocked(context, _conn), do: context
end
