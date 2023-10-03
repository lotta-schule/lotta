defmodule LottaWeb.GraphQLSocket do
  require Logger

  alias Lotta.{Repo, Tenants}
  alias LottaWeb.Context
  alias LottaWeb.Auth.AccessToken

  use Absinthe.GraphqlWS.Socket, schema: LottaWeb.Schema

  @impl true
  def handle_init(%{"token" => token, "tid" => tenant_id}, socket) do
    tenant = Tenants.get_tenant(tenant_id)

    if is_nil(tenant) do
      {:error, %{reason: "Invalid tenant"}, socket}
    else
      Repo.put_prefix(tenant.prefix)

      case AccessToken.resource_from_token(token) do
        {:ok, user, _claims} ->
          socket =
            socket
            |> Absinthe.GraphqlWS.Util.assign_context(
              current_user: Context.set_virtual_user_fields(user),
              tenant: tenant
            )

          {:ok,
           %{
             tenant_id: tenant.id,
             current_user_id: user.id
           }, socket}

        e ->
          Logger.error(inspect(e))
          {:error, %{}, socket}
      end
    end
  end
end
