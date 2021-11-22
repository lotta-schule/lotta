defmodule Lotta.TenantCacheServer do
  use GenServer

  import Ecto.Query

  alias Lotta.Repo
  alias Lotta.Tenants
  alias Lotta.Tenants.Tenant

  @impl true
  def init(_opts) do
    {:ok,
     Enum.map(
       Repo.all(
         from t in Tenant,
           prefix: "public",
           preload: [:domains]
       ),
       &Map.put(&1, :configuration, Tenants.get_configuration(&1))
     )}
  end

  @impl true
  def handle_call({:lookup, key, value}, _from, tenants) do
    {:reply, Enum.find(tenants, &(Map.get(&1, key) == value)), tenants}
  end

  @impl true
  def handle_call({:lookup_domain, host}, _from, tenants) do
    {:reply,
     Enum.find(tenants, fn tenant ->
       Enum.any?(tenant.domains, &(&1.host == host))
     end), tenants}
  end

  def handle_call(:list, _from, tenants) do
    {:reply, tenants, tenants}
  end

  @impl true
  def handle_cast({:create, tenant}, tenants) do
    {:noreply, [tenants | tenant]}
  end

  def handle_cast({:update, tenant}, tenants) do
    {:noreply, [Enum.filter(tenants, &(&1.id != tenant.id)) | tenant]}
  end

  @doc """
  Starts the cache server
  """
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, :ok, opts)
  end

  @doc """
  List all tenants in the cache
  """
  @doc since: "3.1.0"
  def list_tenants() do
    GenServer.call(__MODULE__, :list)
  end

  @doc """
  Get a tenant by its id
  """
  @doc since: "3.1.0"
  def get_tenant(id) do
    GenServer.call(__MODULE__, {:lookup, :id, id})
  end

  @doc """
  Get a tenant by its slug
  """
  @doc since: "3.1.0"
  def get_tenant_by_slug(slug) do
    GenServer.call(__MODULE__, {:lookup, :slug, slug})
  end

  @doc """
  Get a tenant by a given prefix
  """
  @doc since: "3.1.0"
  def get_tenant_by_prefix(prefix) do
    GenServer.call(__MODULE__, {:lookup, :prefix, prefix})
  end

  @doc """
  Get a tenant by the host of a given custom domain
  """
  @doc since: "3.1.0"
  def get_tenant_by_custom_domain(host) do
    GenServer.call(__MODULE__, {:lookup_domain, host})
  end

  @doc """
  Update the data for a tenant
  """
  @doc since: "3.1.0"
  def update(tenant) do
    GenServer.call(__MODULE__, {:update, tenant})
  end
end
