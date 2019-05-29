defmodule Api.TenantResolver do
  alias Api.Tenants
  alias Api.Tenants.AuthHelper

  def all(_args, _info) do
    {:ok, Tenants.list_tenants()}
  end

  def current(_args, %{context: %{context: %{tenant_slug: slug}}}) do
    {:ok, Tenants.get_tenant!(slug)}
  end

  def find(%{id: id}, _info) do
    case Accounts.get_user!(id) do
      nil -> {:error, "Nutzer mit der id #{id} nicht gefunden."}
      user -> {:ok, user}
    end
  end

  def register(%{user: user_params}, _info) do
    with {:ok, user} <- Accounts.register_user(user_params),
        {:ok, jwt, _} <- Api.Guardian.encode_and_sign(user, %{email: user.email,name: user.name}, token_type: "access") do
      {:ok, %{user: user, token: jwt}}
    end
  end
  
  def login(%{username: username, password: password}, _info) do
    with {:ok, user} <- AuthHelper.login_with_username_pass(username, password),
        {:ok, jwt, _} <- Api.Guardian.encode_and_sign(user, %{email: user.email,name: user.name}, token_type: "access") do
      {:ok, %{user: user, token: jwt}}
    end
  end

  def update(%{id: id, user: user_params}, _info) do
    Accounts.get_user!(id)
    |> Accounts.update_user(user_params)
  end
end