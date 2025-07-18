defmodule LottaWeb.Context do
  @moduledoc """
    Plug which builds a context for connections into the app.
    Will provide user account information
  """

  require Logger

  alias Lotta.Repo
  alias Lotta.Accounts
  alias Lotta.Accounts.User
  alias Lotta.Tenants.Tenant

  @behaviour Plug
  @behaviour Access

  @type t() :: %{
          :current_user => User.t(),
          :tenant => Tenant.t()
        }

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _blueprint) do
    context =
      __MODULE__.new()
      |> maybe_put_tenant(conn)
      |> maybe_put_user(conn)

    Absinthe.Plug.put_options(conn, context: context)
  end

  @impl true
  def fetch(%{} = context, key), do: Map.fetch(context, key)

  @impl true
  def get_and_update(%{} = context, key, func),
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
      all_user_groups(user)

    user
    |> Map.put(:all_groups, groups)
    |> Map.put(:is_admin?, Enum.any?(groups, & &1.is_admin_group))
  end

  @impl true
  def pop(data, key) do
    Map.pop(data, key)
  end

  @doc """
  Create a new context map"
  """
  @doc since: "5.0.12"
  @spec new(current_user: User.t() | nil, tenant: Tenant.t() | nil) :: t()
  def new(opts \\ []) do
    %{
      current_user: Keyword.get(opts, :current_user, nil),
      tenant: Keyword.get(opts, :tenant, nil)
    }
  end

  defp maybe_put_user(%{tenant: %{id: tid}} = context, conn) do
    claims = LottaWeb.Auth.AccessToken.Plug.current_claims(conn)

    if to_string(claims["tid"]) == to_string(tid) do
      access_level =
        case claims do
          %{"typ" => token_type} ->
            token_type

          _ ->
            nil
        end

      case LottaWeb.Auth.AccessToken.Plug.current_resource(conn) do
        nil ->
          context

        user ->
          user =
            user
            |> set_virtual_user_fields()
            |> Map.put(:access_level, access_level)

          Sentry.Context.set_user_context(%{
            id: user.id,
            email: user.email,
            name: user.name,
            tenant_id: context.tenant.id,
            is_admin: user.is_admin?,
            all_groups:
              Enum.map(
                user.all_groups,
                &%{
                  id: &1.id,
                  name: &1.name,
                  is_admin_group: &1.is_admin_group
                }
              )
          })

          OpenTelemetry.Tracer.set_attributes(%{"user.id" => user.id})

          context
          |> Map.put(:current_user, user)
      end
    else
      context
    end
  end

  defp maybe_put_user(context, _conn), do: context

  defp maybe_put_tenant(context, %{private: %{lotta_tenant: tenant}}) do
    context =
      context
      |> Map.put(:tenant, tenant)

    Sentry.Context.set_tags_context(%{
      "tenant.id" => tenant.id,
      "tenant.slug" => tenant.slug,
      "tenant.prefix" => tenant.prefix
    })

    context
  end

  defp maybe_put_tenant(context, _conn), do: context

  defp get_dynamic_groups(%User{enrollment_tokens: enrollment_tokens}),
    do: Accounts.list_groups_for_enrollment_tokens(enrollment_tokens)

  defp all_user_groups(%User{groups: assigned_groups} = user),
    do: assigned_groups ++ get_dynamic_groups(user)
end
