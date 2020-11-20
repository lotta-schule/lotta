defmodule ApiWeb.Context do
  @moduledoc """
    Plug which builds a context for connections into the app.
    Will provide user account information
  """

  @behaviour Plug

  require Logger

  import Api.Accounts.Permissions

  alias Api.Accounts
  alias Api.Accounts.User

  def init(opts), do: opts

  def call(conn, _blueprint) do
    context =
      %{}
      |> maybe_put_user(conn)
      |> maybe_put_user_is_blocked(conn)

    conn
    |> Absinthe.Plug.put_options(context: context)
  end

  defp maybe_put_user(context, conn) do
    case ApiWeb.Auth.AccessToken.Plug.current_resource(conn) do
      user when not is_nil(user) ->
        if System.get_env("APP_ENVIRONMENT") != "test" do
          Task.start(fn -> Accounts.see_user(user) end)
        end

        context
        |> Map.put(:current_user, user)
        |> Map.put(
          :user_group_ids,
          Enum.map(User.get_groups(user), & &1.id)
        )
        |> Map.put(
          :user_is_admin,
          user_is_admin?(user)
        )

      nil ->
        context
        |> Map.put(:user_group_ids, [])
        |> Map.put(:user_is_admin, false)
    end
  end

  defp maybe_put_user_is_blocked(%{current_user: user} = context, _conn) do
    if user.is_blocked do
      Logger.warn("User #{user.email} is blocked.")
      Map.put(context, :user_is_blocked, true)
    else
      context
    end
  end

  defp maybe_put_user_is_blocked(context, _conn), do: context
end
