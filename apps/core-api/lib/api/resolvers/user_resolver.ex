defmodule Api.UserResolver do
  alias Api.Accounts
  alias Api.Accounts.{AuthHelper,User}

  def all_with_groups(_args, %{context: %{context: %{current_user: current_user, tenant: tenant}}}) do
    case User.is_admin?(current_user, tenant) do
      true -> {:ok, Accounts.list_users_with_groups(tenant.id)}
      _ -> {:error, "Nur Administrator dürfen auf Benutzer auflisten"}
    end
  end

  def get(%{id: id}, %{context: %{context: %{current_user: current_user, tenant: tenant}}}) do
    if User.is_admin?(current_user, tenant) do
      case Accounts.get_user!(id) do
        nil -> {:error, "Nutzer mit der id #{id} nicht gefunden."}
        user -> {:ok, user}
      end
    else
      {:error, "Nur Administrator dürfen auf Benutzer auflisten"}
    end
  end

  def assign_user(%{id: id, group_id: group_id}, %{context: %{context: %{current_user: current_user, tenant: tenant}}}) do
    if User.is_admin?(current_user, tenant) do
      group = Accounts.get_user_group!(group_id)
      if group != nil and group.tenant_id == tenant.id do
        case Accounts.get_user!(id) do
          nil -> {:error, "Nutzer mit der id #{id} nicht gefunden."}
          user -> Accounts.assign_user_to_group(user, group)
        end
      else
        {:error, "Gruppe mit der id #{group_id} nicht gefunden."}
      end
    else
      {:error, "Nur Administrator dürfen Benutzer Gruppen zuweisen"}
    end
  end
  
  def find(%{searchtext: searchtext}, %{context: %{context: %{current_user: current_user, tenant: tenant}}}) do
    case User.is_admin?(current_user, tenant) do
      true -> Accounts.search_user(searchtext, tenant)
      _ -> {:error, "Nur Administrator dürfen auf Benutzer auflisten"}
    end
  end

  def register(%{user: user_params}, %{context: %{context: %{tenant: tenant}}}) do
    with {:ok, user} <- Accounts.register_user(user_params |> Map.put(:tenant_id, tenant.id)),
        {:ok, jwt, _} <- Api.Guardian.encode_and_sign(user, %{
          email: user.email,
          nickname: user.nickname,
          name: user.name,
          class: user.class
        }) do
      {:ok, %{user: user, token: jwt}}
    end
  end
  
  def login(%{username: username, password: password}, _info) do
    with {:ok, user} <- AuthHelper.login_with_username_pass(username, password),
        {:ok, jwt, _} <- Api.Guardian.encode_and_sign(user, %{
          email: user.email,
          nickname: user.nickname,
          name: user.name,
          class: user.class
        }) do
      {:ok, %{user: user, token: jwt}}
    end
  end

  def update(%{id: id, user: user_params}, _info) do
    Accounts.get_user!(id)
    |> Accounts.update_user(user_params)
  end
end