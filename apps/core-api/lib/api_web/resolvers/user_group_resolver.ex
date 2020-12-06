defmodule ApiWeb.UserGroupResolver do
  @moduledoc false

  import Api.Accounts.Permissions
  import ApiWeb.ErrorHelpers

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
    {:ok,
     if user_is_admin?(current_user) do
       user_group
       |> Repo.preload(:enrollment_tokens)
       |> Map.fetch!(:enrollment_tokens)
     else
       []
     end}
  end

  def all(_args, _info), do: {:ok, Accounts.list_user_groups()}

  def get(%{id: id}, _info) do
    {:ok, Accounts.get_user_group(id)}
  end

  def create(%{group: group_input}, _info) do
    Accounts.create_user_group(group_input)
    |> format_errors("Fehler beim Anlegen der Gruppe")
  end

  def update(%{id: id, group: group_input}, _info) do
    group = Accounts.get_user_group(id)

    if is_nil(group) do
      {:error, "Gruppe mit der id #{id} existiert nicht."}
    else
      group
      |> Accounts.update_user_group(group_input)
      |> format_errors("Fehler beim Bearbeiten der Gruppe")
    end
  end

  def delete(%{id: id}, _info) do
    group = Accounts.get_user_group(id)

    if is_nil(group) do
      {:error, "Gruppe existiert nicht."}
    else
      Accounts.delete_user_group(group)
      |> format_errors("Fehler beim Löschen  der Gruppe")
    end
  end
end
