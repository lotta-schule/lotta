defmodule LottaWeb.UserGroupResolver do
  @moduledoc false

  import Absinthe.Resolution.Helpers, only: [on_load: 2]
  import LottaWeb.ErrorHelpers

  alias Lotta.Accounts
  alias Lotta.Accounts.User

  @doc """
  Resolves the `groups` of an article, category or widget, limited to the
  groups the current user may see.

  The groups of all models in the same GraphQL response are loaded in one
  batched query (via Dataloader) instead of one query per model.
  """
  def resolve_model_groups(
        model,
        _args,
        %{
          context: %{current_user: user} = context
        }
      ) do
    case Ecto.assoc_loaded?(model.groups) do
      true ->
        {:ok, filter_visible_groups(model.groups, user)}

      false ->
        context.loader
        |> Dataloader.load(Lotta.Accounts, :groups, model)
        |> on_load(fn loader ->
          loader
          |> Dataloader.get(Lotta.Accounts, :groups, model)
          |> filter_visible_groups(user)
          |> then(&{:ok, &1})
        end)
    end
  end

  defp filter_visible_groups(groups, user) do
    group_ids = if user, do: Enum.map(user.all_groups, & &1.id), else: []
    is_admin = user && user.is_admin?

    groups
    |> Enum.sort_by(& &1.sort_key)
    |> Enum.reverse()
    |> Enum.filter(&(is_admin || &1.id in group_ids))
  end

  def resolve_enrollment_tokens(_user_group, _args, %{
        context: %{current_user: %User{is_admin?: false}}
      }),
      do: []

  def resolve_enrollment_tokens(user_group, _args, %{
        context: %{current_user: %User{is_admin?: true}}
      }) do
    {:ok, user_group.enrollment_tokens}
  end

  def all(_args, %{
        context: %{current_user: %User{is_admin?: is_admin, all_groups: user_groups}}
      }) do
    if is_admin do
      {:ok, Accounts.list_user_groups()}
    else
      {:ok, user_groups}
    end
  end

  def all(_args, _info), do: {:ok, []}

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

    case group do
      nil ->
        {:error, "Gruppe mit der id #{id} existiert nicht."}

      %{eduplaces_id: id} when not is_nil(id) ->
        {:error, "Gruppe ist mit Eduplaces synchronisiert und kann nicht gelöscht werden."}

      group ->
        Accounts.delete_user_group(group)
    end
  end
end
