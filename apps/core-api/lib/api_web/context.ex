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
  @behaviour Access

  @type t() :: %{
          :current_user => User.t()
        }
  defstruct [:current_user]

  def init(opts), do: opts

  def call(conn, _blueprint) do
    context =
      %__MODULE__{}
      |> maybe_put_user(conn)

    conn
    |> Absinthe.Plug.put_options(context: context)
  end

  def fetch(%__MODULE__{} = context, key), do: Map.fetch(context, key)

  def get_and_update(%__MODULE__{} = context, key, func) do
    Map.get_and_update(context, key, func)
  end

  @doc """
  Set the virtual user_fields for a given user
  """
  @spec set_virtual_user_fields(User.t()) :: User.t()
  def set_virtual_user_fields(%User{} = user) do
    user =
      user
      |> Repo.preload([:groups, :enrollment_tokens])

    groups =
      user
      |> all_user_groups()

    user
    |> Map.put(:all_groups, groups)
    |> Map.put(:is_admin?, Enum.any?(groups, & &1.is_admin_group))
  end

  defp maybe_put_user(%__MODULE__{} = context, conn) do
    access_level =
      conn
      |> ApiWeb.Auth.AccessToken.Plug.current_claims()
      |> case do
        %{"typ" => token_type} ->
          token_type

        _ ->
          nil
      end

    user =
      conn
      |> ApiWeb.Auth.AccessToken.Plug.current_resource()

    user =
      if not is_nil(user) do
        if System.get_env("APP_ENVIRONMENT") != "test" do
          Task.start(fn -> Accounts.see_user(user) end)
        end

        user
        |> set_virtual_user_fields()
        |> Map.put(:access_level, access_level)
      end

    context
    |> Map.put(:current_user, user)
  end

  defp get_dynamic_groups(%User{enrollment_tokens: enrollment_tokens}) do
    enrollment_tokens
    |> Enum.map(& &1.enrollment_token)
    |> Accounts.list_groups_for_enrollment_tokens()
  end

  defp all_user_groups(%User{groups: assigned_groups} = user) do
    assigned_groups ++ get_dynamic_groups(user)
  end
end
