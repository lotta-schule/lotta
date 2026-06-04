defmodule Lotta.Eduplaces.IDMBehaviour do
  @moduledoc false
  alias Lotta.Accounts.UserGroup
  alias Lotta.Tenants.Tenant

  @callback list_groups(Tenant.t()) :: {:ok, list()} | {:error, any()}
  @callback get_group(UserGroup.t()) :: {:ok, map()} | {:error, any()}
  @callback get_user(String.t()) :: {:ok, map()} | {:error, any()}
end
