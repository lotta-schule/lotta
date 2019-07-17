defmodule Api.TenantResolver do
  alias Api.Tenants
  alias Api.Tenants.AuthHelper

  def all(_args, _info) do
    {:ok, Tenants.list_tenants()}
  end

  def current(_args, %{context: %{context: %{tenant: tenant}}}) do
    IO.inspect("should publish to queue service")
    {:ok, tenant}
  end
  def current(_args, _info) do
    {:ok, nil}
  end

  def find(%{id: id}, _info) do
    case Accounts.get_user!(id) do
      nil -> {:error, "Nutzer mit der id #{id} nicht gefunden."}
      user -> {:ok, user}
    end
  end

  def update(%{id: id, user: user_params}, _info) do
    Accounts.get_user!(id)
    |> Accounts.update_user(user_params)
  end
end