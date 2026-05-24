defmodule Lotta.Administration.Notification.SlackBehaviour do
  alias Lotta.Accounts.User
  alias Lotta.Tenants.Tenant

  @callback new_lotta_notification(Tenant.t(), [User.t()]) :: map()
  @callback new_lotta_invoices_to_issue_notification(list()) :: map()
  @callback send(map()) :: {:ok, any()} | {:error, any()}
end
