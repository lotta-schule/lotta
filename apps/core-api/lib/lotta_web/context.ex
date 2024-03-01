defmodule LottaWeb.Context do
  @moduledoc """
    Plug which builds a context for connections into the app.
    Will provide user account information
  """

  require Logger

  alias Lotta.Repo
  alias Lotta.Accounts
  alias Lotta.Tenants
  alias Lotta.Accounts.User
  alias Lotta.Tenants.Tenant

  @behaviour Plug
  @behaviour Access

  @type t() :: %{
          :current_user => User.t(),
          :tenant => Tenant.t()
        }
  defstruct [:current_user, :tenant]

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _blueprint) do
    context =
      %__MODULE__{}
      |> maybe_put_tenant(conn)
      |> maybe_put_user(conn)

    Absinthe.Plug.put_options(conn, context: context)
  end

  @impl true
  def fetch(%__MODULE__{} = context, key), do: Map.fetch(context, key)

  @impl true
  def get_and_update(%__MODULE__{} = context, key, func),
    do: Map.get_and_update(context, key, func)

  @doc """
  Set the virtual user_fields for a given user
  """
  @spec set_virtual_user_fields(User.t()) :: User.t()
  def set_virtual_user_fields(%User{} = user) do
    user =
      user
      |> Repo.preload([:groups])

    groups =
      user
      |> all_user_groups()

    user
    |> Map.put(:all_groups, groups)
    |> Map.put(:is_admin?, Enum.any?(groups, & &1.is_admin_group))
  end

  @doc """
  Set the virtual tenant fields (configuration) for the current tenant
  """
  @spec set_virtual_tenant_fields(Tenant.t()) :: Tenant.t()
  def set_virtual_tenant_fields(%Tenant{} = tenant) do
    Map.put(tenant, :configuration, Tenants.get_configuration(tenant))
  end

  @impl true
  def pop(data, key) do
    Map.pop(data, key)
  end

  defp maybe_put_user(%__MODULE__{tenant: %{id: tid}} = context, conn) do
    claims = LottaWeb.Auth.AccessToken.Plug.current_claims(conn)

    if to_string(claims["tid"]) == to_string(tid) do
      access_level =
        case claims do
          %{"typ" => token_type} ->
            token_type

          _ ->
            nil
        end

      user =
        conn
        |> LottaWeb.Auth.AccessToken.Plug.current_resource()

      user =
        unless is_nil(user) do
          user
          |> set_virtual_user_fields()
          |> Map.put(:access_level, access_level)
        end

      context
      |> Map.put(:current_user, user)
    else
      context
    end
  end

  defp maybe_put_user(context, _conn), do: context

  defp maybe_put_tenant(context, %{private: %{lotta_tenant: tenant}}),
    do: Map.put(context, :tenant, tenant)

  defp maybe_put_tenant(context, _conn), do: context

  defp get_dynamic_groups(%User{enrollment_tokens: enrollment_tokens}),
    do: Accounts.list_groups_for_enrollment_tokens(enrollment_tokens)

  defp all_user_groups(%User{groups: assigned_groups} = user),
    do: assigned_groups ++ get_dynamic_groups(user)
end
