defmodule LottaWeb.UserSocket do
  require Logger

  use Phoenix.Socket
  use Absinthe.Phoenix.Socket, schema: LottaWeb.Schema

  alias Lotta.Repo
  alias Lotta.Tenants
  alias LottaWeb.Context

  ## Channels
  # channel "messages:user:*", LottaWeb.MessagesChannel
  # channel "messages:group:*", LottaWeb.MessagesChannel

  # Socket params are passed from the client and can
  # be used to verify and authenticate a user. After
  # verification, you can put default assigns into
  # the socket that will be set for all channels, ie
  #
  #     {:ok, assign(socket, :user_id, verified_user_id)}
  #
  # To deny connection, return `:error`.
  #
  # See `Phoenix.Token` documentation for examples in
  # performing token verification on connect.
  def connect(%{"token" => token, "tid" => tenant_id}, socket, _connect_info) do
    tenant = Tenants.get_tenant(tenant_id)

    if is_nil(tenant) do
      :error
    else
      Repo.put_prefix(tenant.prefix)

      case LottaWeb.Auth.AccessToken.resource_from_token(token) do
        {:ok, user, _claims} ->
          socket =
            Absinthe.Phoenix.Socket.put_options(socket,
              context: %Context{
                current_user: Context.set_virtual_user_fields(user),
                tenant: tenant
              }
            )

          {:ok, socket}

        e ->
          Logger.error(inspect(e))
          :error
      end
    end
  end

  def connect(%{"tid" => tenant_id}, socket, _connect_info) do
    tenant = Tenants.get_tenant(tenant_id)

    if is_nil(tenant) do
      :error
    else
      Repo.put_prefix(tenant.prefix)

      socket =
        Absinthe.Phoenix.Socket.put_options(socket,
          context: %Context{
            tenant: tenant
          }
        )

      {:ok, socket}
    end
  end

  def connect(_args, _socket, _connect_info), do: :error

  # Socket id's are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "user_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     LottaWeb.Endpoint.broadcast("user_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
  def id(_socket), do: nil
end
