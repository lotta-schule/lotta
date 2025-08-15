defmodule Lotta.Worker.Tenant do
  @moduledoc """
  Worker for fetching a files metadata.
  """
  alias Lotta.Accounts.User
  alias Lotta.{Analytics, Tenants}
  alias Lotta.Tenants.{DefaultContent, Tenant}

  use Oban.Worker,
    queue: :tenant,
    max_attempts: 3,
    # 0-9, 0 is highest
    priority: 0,
    unique: [
      period: :infinity,
      timestamp: :scheduled_at,
      states: Oban.Job.states(),
      fields: [:worker, :args]
    ]

  require Logger

  @impl Oban.Worker
  def perform(%{
        id: _job_id,
        args: %{
          "type" => "setup",
          "id" => tenant_id,
          "user_email" => email,
          "user_password" => password
        }
      }) do
    tenant = Tenants.get_tenant(tenant_id) || raise "Tenant not found"

    user =
      Lotta.Repo.get_by(User, [email: email], prefix: tenant.prefix) || raise "User not found"

    user = Map.put(user, :password, password)

    with :ok <- DefaultContent.create_default_content(tenant, user) do
      init_analytics(tenant)
      :ok
    end
  end

  def perform(%{
        id: _job_id,
        args: %{"type" => "init_analytics", "id" => tenant_id}
      }) do
    with {:ok, tenant} <- Tenants.get_tenant(tenant_id) do
      Analytics.create_site(tenant)
    end
  end

  @impl Oban.Worker
  def timeout(_job), do: :timer.minutes(5)

  @spec setup_default_content(Tenant.t(), User.t()) ::
          {:ok, Oban.Job.t()} | {:error, String.t()}
  def setup_default_content(%Tenant{id: id}, %User{email: email, password: password}) do
    __MODULE__.new(%{
      "type" => "setup",
      "id" => id,
      "user_email" => email,
      "user_password" => password
    })
    |> Oban.insert()
  end

  @spec init_analytics(Tenant.t()) ::
          {:ok, Oban.Job.t()} | {:error, String.t()}
  def init_analytics(%{id: id}) do
    __MODULE__.new(%{
      "type" => "init_analytics",
      "id" => id
    })
    |> Oban.insert()
  end

  @spec delete_analytics(Tenant.t()) ::
          {:ok, Oban.Job.t()} | {:error, String.t()}
  def delete_analytics(%{site_id: site_id}) do
    __MODULE__.new(%{
      "type" => "delete_analytics",
      "site_id" => site_id
    })
    |> Oban.insert()
  end
end
