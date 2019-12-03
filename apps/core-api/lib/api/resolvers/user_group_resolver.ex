defmodule Api.UserGroupResolver do
  alias Api.Repo
  alias Api.Accounts
  alias Api.Accounts.User

  def resolve_model_groups(_args, %{source: model}) do
    groups =
      model
      |> Repo.preload(:groups)
      |> Map.fetch!(:groups)
      |> Enum.sort_by(&(&1.sort_key))
      |> Enum.reverse()
    {:ok, groups}
  end

  def resolve_enrollment_tokens(user_group, _args, %{context: %{current_user: current_user}}) do
    tenant = user_group |> Repo.preload(:tenant) |> Map.fetch!(:tenant)
    case User.is_admin?(current_user, tenant) do
      true ->
        {:ok, user_group
        |> Repo.preload(:enrollment_tokens)
        |> Map.fetch!(:enrollment_tokens)}
      _ ->
        {:ok, []}
    end
  end


  def get(%{id: id}, %{context: %{tenant: tenant} = context}) do
    if context[:current_user] && User.is_admin?(context.current_user, tenant) do
      try do
        {:ok, Accounts.get_user_group!(id)}
      rescue
        Ecto.NoResultsError -> {:ok, nil}
      end
    else
      {:error, "Nur Administratoren dürfen Gruppen anzeigen."}
    end
  end

  def update(%{id: id, group: group_input}, %{context: %{tenant: tenant} = context}) do
    if context[:current_user] && User.is_admin?(context.current_user, tenant) do
      try do
        group = Accounts.get_user_group!(id)
        Accounts.update_user_group(group, group_input)
      rescue
        Ecto.NoResultsError -> {:error, "Gruppe existiert nicht."}
      end
    else
      {:error, "Nur Administratoren dürfen Gruppen bearbeiten."}
    end
  end
end