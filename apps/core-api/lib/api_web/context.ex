defmodule ApiWeb.Context do
  @moduledoc """
    Plug which builds a context for connections into the app.
    Will provide user account information
  """

  require Logger

  alias Api.Accounts
  alias Api.Accounts.User
  alias Api.Repo

  @behaviour Plug

  @type t() :: %{
          :current_user => User.t()
        }
  defstruct [:current_user]

  def init(opts), do: opts

  def call(conn, _blueprint) do
    context =
      %__MODULE__{}
      |> maybe_put_user(conn)
      |> set_virtual_user_fields()

    conn
    |> Absinthe.Plug.put_options(context: context)
  end

  defp maybe_put_user(%__MODULE__{} = context, conn) do
    user =
      conn
      |> ApiWeb.Auth.AccessToken.Plug.current_resource()

    user =
      if not is_nil(user) do
        if System.get_env("APP_ENVIRONMENT") != "test" do
          Task.start(fn -> Accounts.see_user(user) end)
        end

        user
        |> Repo.preload([:groups, :enrollment_tokens])
      end

    context
    |> Map.put(:current_user, user)
  end

  defp set_virtual_user_fields(%{current_user: user} = context) when not is_nil(user) do
    groups =
      user
      |> all_user_groups()

    user =
      user
      |> Map.put(:all_groups, groups)
      |> Map.put(:is_admin?, Enum.any?(groups, & &1.is_admin_group))

    context
    |> Map.put(:current_user, user)
  end

  defp set_virtual_user_fields(context), do: context

  defp get_dynamic_groups(%User{enrollment_tokens: enrollment_tokens}) do
    enrollment_tokens
    |> Enum.map(& &1.enrollment_token)
    |> Accounts.list_groups_for_enrollment_tokens()
  end

  defp all_user_groups(%User{groups: assigned_groups} = user) do
    assigned_groups ++ get_dynamic_groups(user)
  end
end
