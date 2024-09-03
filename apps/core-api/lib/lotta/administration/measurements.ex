defmodule Lotta.Administration.Measurements do
  @moduledoc """
  Gather measurements for a multitude of Lottas.
  """
  alias Lotta.Repo
  alias Lotta.Tenants.Tenant

  def count_tenants do
    Repo.aggregate(Tenant, :count, :id)
  end
end
