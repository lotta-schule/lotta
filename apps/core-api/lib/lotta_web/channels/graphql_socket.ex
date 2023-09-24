defmodule LottaWeb.GraphQLSocket do
  alias Lotta.{Repo, Tenants}
  alias LottaWeb.Context
  alias LottaWeb.Auth.AccessToken
  alias Absinthe.Phoenix.Socket

  use Absinthe.GraphqlWS.Socket, schema: LottaWeb.Schema

  def handle_init(%{"token" => token, "tid" => tenant_id}, socket) do
    tenant = Tenants.get_tenant(tenant_id)
    IO.inspect(tenant)
    IO.inspect(token)

    if is_nil(tenant) do
      {:error, %{reason: "Invalid tenant"}, socket}
    else
      Repo.put_prefix(tenant.prefix)

      case AccessToken.resource_from_token(token) do
        {:ok, user, _claims} ->
          context = %Context{
            current_user: Context.set_virtual_user_fields(user),
            tenant: tenant
          }

          socket =
            socket
            |> IO.inspect()
            |> Absinthe.GraphqlWS.Util.assign_context(context: context)
            |> IO.inspect()

          {:ok,
           %{
             tenant_id: tenant.id,
             current_user_id: user.id
           }, socket}

        e ->
          IO.inspect("uuuuuupsi")
          Logger.error(inspect(e))
          {:error, %{}, socket}
      end
    end
    |> IO.inspect()
  end
end
