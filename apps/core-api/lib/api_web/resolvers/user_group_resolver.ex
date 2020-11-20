defmodule ApiWeb.UserGroupResolver do
  @moduledoc """
    GraphQL Resolver Module for finding, creating, updating and deleting user groups
  """

  import Api.Accounts.Permissions

  alias ApiWeb.ErrorHelpers
  alias Api.Repo
  alias Api.Accounts

  def resolve_model_groups(_args, %{source: model}) do
    groups =
      model
      |> Repo.preload(:groups)
      |> Map.fetch!(:groups)
      |> Enum.sort_by(& &1.sort_key)
      |> Enum.reverse()

    {:ok, groups}
  end

  def resolve_enrollment_tokens(user_group, _args, %{context: %{current_user: current_user}}) do
    case user_is_admin?(current_user) do
      true ->
        {:ok,
         user_group
         |> Repo.preload(:enrollment_tokens)
         |> Map.fetch!(:enrollment_tokens)}

      _ ->
        {:ok, []}
    end
  end

  def all(_args, _info), do: {:ok, Accounts.list_user_groups()}

  def get(%{id: id}, %{context: %{current_user: _user, user_is_admin: true}}) do
    {:ok, Accounts.get_user_group(id)}
  end

  def get(_args, _info), do: {:error, "Nur Administratoren dürfen Gruppen anzeigen."}

  def create(%{group: group_input}, %{context: context}) do
    if context[:current_user] && user_is_admin?(context.current_user) do
      case Accounts.create_user_group(group_input) do
        {:ok, group} ->
          {:ok, group}

        {:error, error} ->
          {:error,
           [
             "Fehler beim Anlegen der Gruppe",
             details: ErrorHelpers.extract_error_details(error)
           ]}
      end
    else
      {:error, "Nur Administratoren dürfen Gruppen erstellen."}
    end
  end

  def update(%{id: id, group: group_input}, %{
        context: %{current_user: _user, user_is_admin: true}
      }) do
    case Accounts.get_user_group(id) do
      nil ->
        {:error, "Gruppe existiert nicht."}

      group ->
        Accounts.update_user_group(group, group_input)
    end
  end

  def update(_args, _info), do: {:error, "Nur Administratoren dürfen Gruppen bearbeiten."}

  def delete(%{id: id}, %{
        context: %{current_user: _user, user_is_admin: true}
      }) do
    case Accounts.get_user_group(id) do
      nil ->
        {:error, "Gruppe existiert nicht."}

      group ->
        Accounts.delete_user_group(group)
    end
  end

  def delete(_args, _info), do: {:error, "Nur Administratoren dürfen Gruppen löschen."}
end
