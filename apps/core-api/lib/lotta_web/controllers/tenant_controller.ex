defmodule LottaWeb.TenantController do
  use LottaWeb, :controller

  import Plug.Conn

  import Ecto.Query

  alias Ecto.Changeset
  alias Lotta.{Tenants, Repo}
  alias Lotta.Accounts.User

  def create_test(conn, %{"tenant" => tenant_params, "user" => user_params}) do
    tenant_params = atomize_keys(tenant_params)
    user_params = atomize_keys(user_params)

    case Tenants.create_tenant(user_params: user_params, tenant: tenant_params) do
      {:ok, _tenant} ->
        send_resp(conn, :ok, Jason.encode!(%{success: true}))

      {:error, _phase, %Changeset{} = changeset} ->
        send_resp(
          conn,
          :bad_request,
          Jason.encode!(%{error: LottaWeb.ErrorHelpers.extract_error_details(changeset)})
        )

      {:error, _phase, reason} ->
        send_resp(conn, :internal_server_error, Jason.encode!(inspect(reason)))
    end
  end

  def delete_tenant(conn, %{"tenant" => %{"id" => tenant_id}}) do
    tenant = Tenants.get_tenant(tenant_id)

    case Tenants.delete_tenant(tenant) do
      {:ok, _tenant} ->
        send_resp(conn, :ok, Jason.encode!(%{success: true}))

      other ->
        send_resp(conn, :internal_server_error, Jason.encode!(other))
    end
  end

  def list_user_tenants(conn, args) do
    username = Map.get(args, "username", "")

    Tenants.list_tenants()
    |> Enum.filter(fn %{prefix: prefix} ->
      from(u in User,
        where: u.email == ^username
      )
      |> Repo.exists?(prefix: prefix)
    end)
    |> Enum.map(fn tenant ->
      configuration = Tenants.get_configuration(tenant)
      logo_image_file = Map.get(configuration, :logo_image_file)
      background_image_file = Map.get(configuration, :background_image_file)

      %{
        id: tenant.id,
        title: tenant.title,
        slug: tenant.slug,
        logoImageFileId:
          if(logo_image_file != nil,
            do: Map.get(logo_image_file, :id),
            else: nil
          ),
        backgroundImageFileId:
          if(background_image_file != nil,
            do: Map.get(background_image_file, :id),
            else: nil
          )
      }
    end)
    |> then(fn tenants ->
      json(conn, %{
        success: true,
        tenants: tenants
      })
    end)
  end

  defp atomize_keys(map) do
    Enum.reduce(map, %{}, fn
      {key, val}, acc when is_atom(key) ->
        Map.put(acc, key, val)

      {key, val}, acc ->
        Map.put(acc, String.to_atom(key), val)
    end)
  end
end
