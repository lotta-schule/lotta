defmodule Api.UserGroupResolver do
  alias Api.Repo

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
    case Api.Accounts.User.is_admin?(current_user, tenant) do
      true ->
        {:ok, user_group
        |> Repo.preload(:enrollment_tokens)
        |> Map.fetch!(:enrollment_tokens)}
      _ ->
        {:ok, []}
    end
  end
end