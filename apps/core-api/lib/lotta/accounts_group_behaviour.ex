defmodule Lotta.AccountsGroupBehaviour do
  alias Lotta.Accounts.{User, UserGroup}

  @callback create_user_group(map()) :: {:ok, UserGroup.t()} | {:error, Ecto.Changeset.t()}
  @callback update_user_group(UserGroup.t(), map()) ::
              {:ok, UserGroup.t()} | {:error, Ecto.Changeset.t()}
  @callback delete_user_group(UserGroup.t()) ::
              {:ok, UserGroup.t()} | {:error, Ecto.Changeset.t()}
  @callback list_users_by_eduplaces_ids([String.t()]) :: [User.t()]
  @callback set_group_members(UserGroup.t(), [User.t()]) ::
              {:ok, UserGroup.t()} | {:error, Ecto.Changeset.t()}
end
