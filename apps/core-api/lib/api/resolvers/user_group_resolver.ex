defmodule Api.UserGroupResolver do
  @moduledoc """
    GraphQL Resolver Module for finding, creating, updating and deleting user groups
  """

  import Api.Accounts.Permissions

  alias Ecto.NoResultsError
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

  def get(%{id: id}, %{context: context}) do
    if context[:current_user] && context[:user_is_admin] do
      try do
        {:ok, Accounts.get_user_group!(id)}
      rescue
        NoResultsError -> {:ok, nil}
      end
    else
      {:error, "Nur Administratoren dürfen Gruppen anzeigen."}
    end
  end

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

  def update(%{id: id, group: group_input}, %{context: context}) do
    if context[:current_user] && user_is_admin?(context.current_user) do
      try do
        Accounts.get_user_group!(id)
        |> Accounts.update_user_group(group_input)
      rescue
        NoResultsError -> {:error, "Gruppe existiert nicht."}
      end
    else
      {:error, "Nur Administratoren dürfen Gruppen bearbeiten."}
    end
  end

  def delete(%{id: id}, %{context: context}) do
    if context[:current_user] && user_is_admin?(context.current_user) do
      try do
        Accounts.get_user_group!(id)
        |> Accounts.delete_user_group()
      rescue
        NoResultsError -> {:error, "Gruppe existiert nicht."}
      end
    else
      {:error, "Nur Administratoren dürfen Gruppen löschen."}
    end
  end
end
