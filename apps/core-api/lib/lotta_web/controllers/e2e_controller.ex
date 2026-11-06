defmodule LottaWeb.E2EController do
  @moduledoc """
  Test data endpoints for the end-to-end test suite (`apps/e2e`).

  Responds with 404 unless the `ENABLE_E2E_API` environment variable is set.
  """
  use LottaWeb, :controller

  alias Lotta.E2E.Seeds
  alias Lotta.Tenants

  action_fallback(LottaWeb.FallbackController)

  plug(:require_e2e_api)

  @doc """
  Seeds groups and users into a tenant. See `Lotta.E2E.Seeds.seed/2`.

      POST /admin/api/seed
      {
        "tenant": {"id": 1},
        "groups": [{"name": "Klasse 5a"}],
        "users": [{"name": "Frodo", "email": "frodo@shire.me", "password": "ring", "groups": ["Schüler"]}]
      }
  """
  def seed(conn, %{"tenant" => %{"id" => tenant_id}} = params) do
    with tenant when not is_nil(tenant) <- Tenants.get_tenant(tenant_id),
         {:ok, result} <-
           Seeds.seed(tenant, %{
             groups: Enum.map(params["groups"] || [], &group_params/1),
             users: Enum.map(params["users"] || [], &user_params/1)
           }) do
      json(conn, %{
        success: true,
        groups: Enum.map(result.groups, &%{id: &1.id, name: &1.name}),
        users:
          Enum.map(
            result.users,
            &%{id: &1.id, name: &1.name, email: &1.email, password: &1.password}
          )
      })
    else
      nil ->
        {:error, :not_found}

      {:error, message} when is_binary(message) ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{success: false, error: message})

      error ->
        error
    end
  end

  def seed(_conn, _params), do: {:error, :bad_request}

  defp group_params(params) do
    %{
      name: params["name"],
      is_admin_group: params["isAdminGroup"] == true,
      enrollment_tokens: params["enrollmentTokens"] || []
    }
  end

  defp user_params(params) do
    %{
      name: params["name"],
      email: params["email"],
      password: params["password"],
      nickname: params["nickname"],
      class: params["class"],
      groups: params["groups"] || []
    }
    |> Map.reject(fn {_key, value} -> is_nil(value) end)
  end

  defp require_e2e_api(conn, _opts) do
    if Application.get_env(:lotta, :e2e_api_enabled, false) do
      conn
    else
      conn
      |> put_status(:not_found)
      |> json(%{success: false, error: "not found"})
      |> halt()
    end
  end
end
