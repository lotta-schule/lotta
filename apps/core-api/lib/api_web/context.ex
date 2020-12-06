defmodule ApiWeb.Context do
  @moduledoc """
    Plug which builds a context for connections into the app.
    Will provide user account information
  """

  require Logger

  import Api.Accounts.Permissions

  alias Api.Accounts
  alias Api.Accounts.{User, UserGroup}

  @behaviour Plug

  @type t() :: %{
          :current_user => User.t(),
          :all_groups => list(UserGroup.t()),
          :is_admin => boolean()
        }
  defstruct [:current_user, :all_groups, :is_admin, :is_blocked]

  def init(opts), do: opts

  def call(conn, _blueprint) do
    context =
      %__MODULE__{
        current_user: nil,
        all_groups: [],
        is_admin: false,
        is_blocked: false
      }
      |> maybe_put_user(conn)
      |> maybe_put_user_is_blocked()

    conn
    |> Absinthe.Plug.put_options(context: context)
  end

  defp maybe_put_user(%__MODULE__{} = context, conn) do
    user =
      conn
      |> ApiWeb.Auth.AccessToken.Plug.current_resource()

    if user do
      if System.get_env("APP_ENVIRONMENT") != "test" do
        Task.start(fn -> Accounts.see_user(user) end)
      end

      context
      |> Map.put(:current_user, user)
      |> Map.put(:all_groups, User.get_groups(user))
      |> Map.put(:is_admin, user_is_admin?(user))
    else
      context
    end
  end

  defp maybe_put_user_is_blocked(%__MODULE__{} = context) do
    case context do
      %{current_user: %{email: email, is_blocked: true}} ->
        Logger.warn("User #{email} is blocked.")

        context
        |> Map.put(:is_blocked, true)

      _ ->
        context
    end
  end
end
