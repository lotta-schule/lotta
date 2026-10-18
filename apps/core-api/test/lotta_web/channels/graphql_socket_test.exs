defmodule LottaWeb.GraphQLSocketTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Ecto.Query

  alias Absinthe.GraphqlWS.Socket
  alias LottaWeb.Auth.AccessToken
  alias LottaWeb.GraphQLSocket
  alias Lotta.Repo
  alias Lotta.Accounts.User
  alias Lotta.Tenants

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)

    tenant = Tenants.get_tenant_by_prefix(@prefix)

    admin =
      Repo.one!(from(u in User, where: u.email == ^"alexis.rinaldoni@lotta.schule"),
        prefix: tenant.prefix
      )

    {:ok, admin_jwt, _} = AccessToken.encode_and_sign(admin)

    socket =
      Socket.new(
        absinthe: %{opts: [context: %{pubsub: LottaWeb.Endpoint}]},
        connect_info: %{},
        endpoint: LottaWeb.Endpoint,
        handler: GraphQLSocket,
        keepalive: 0,
        pubsub: Lotta.PubSub
      )

    {:ok, tenant: tenant, admin: admin, admin_jwt: admin_jwt, socket: socket}
  end

  defp context(%Socket{absinthe: absinthe}), do: Keyword.fetch!(absinthe.opts, :context)

  describe "handle_init/2" do
    test "assigns user and tenant when given a valid token and tenant id", %{
      tenant: tenant,
      admin: admin,
      admin_jwt: admin_jwt,
      socket: socket
    } do
      assert {:ok, %{}, socket} =
               GraphQLSocket.handle_init(%{"token" => admin_jwt, "tid" => tenant.id}, socket)

      assert %{current_user: %User{id: user_id}, tenant: %{id: tenant_id}} = context(socket)
      assert user_id == admin.id
      assert tenant_id == tenant.id
    end

    test "assigns only the tenant when no token is given", %{tenant: tenant, socket: socket} do
      assert {:ok, %{}, socket} = GraphQLSocket.handle_init(%{"tid" => tenant.id}, socket)

      assert %{current_user: nil, tenant: %{id: tenant_id}} = context(socket)
      assert tenant_id == tenant.id
    end

    test "rejects an invalid token", %{tenant: tenant, socket: socket} do
      assert {:error, %{}, _socket} =
               GraphQLSocket.handle_init(%{"token" => "invalid", "tid" => tenant.id}, socket)
    end

    test "rejects an unknown tenant", %{socket: socket} do
      assert {:error, %{reason: "Invalid tenant"}, _socket} =
               GraphQLSocket.handle_init(%{"tid" => 0}, socket)
    end

    test "rejects a payload without tenant id", %{socket: socket} do
      assert {:error, %{reason: "Invalid params"}, _socket} =
               GraphQLSocket.handle_init(%{}, socket)
    end
  end
end
