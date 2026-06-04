defmodule Lotta.BillingsWorkerBehaviour do
  @moduledoc false
  alias Lotta.Tenants.Tenant

  @callback generate_invoice(Tenant.t(), integer(), integer()) ::
              {:ok, map()} | {:error, any()}
end
