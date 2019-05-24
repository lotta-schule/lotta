defmodule Api.UserResolver do
  alias Api.Accounts

  def all(_args, _info) do
    {:ok, Accounts.list_users()}
  end

  def find(%{id: id}, _info) do
    case Accounts.get_user!(id) do
      nil -> {:error, "Nutzer mit der id #{id} nicht gefunden."}
      user -> {:ok, user}
    end
  end

  def register(%{user: user_params}, _info) do
    with {:ok, user} <- Accounts.register_user(user_params) do
      {:ok, %{user: user}}
    end
  end

  def update(%{id: id, user: user_params}, _info) do
    Accounts.get_user!(id)
    |> Accounts.update_user(user_params)
  end
end