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
end