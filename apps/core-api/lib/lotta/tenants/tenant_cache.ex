defmodule Lotta.Tenants.TenantCache do
  @moduledoc """
  Short-lived, node-local cache for the tenant lookups done on every request
  (`LottaWeb.TenantPlug` and `LottaWeb.Auth.AccessToken`).

  Only found tenants are cached; misses always go to the database.

  Writes through `Lotta.Tenants` (and the cockpit) call `invalidate_all/0`,
  which clears the cache on every node of the cluster via `Phoenix.PubSub`.
  Writes that bypass them (e.g. manual SQL) become visible after the TTL.

  Can be disabled with `config :lotta, #{inspect(__MODULE__)}, enabled: false`
  (the default in the test environment, where tenants are created and rolled
  back per test).
  """
  use Supervisor

  alias Lotta.Tenants
  alias Lotta.Tenants.Tenant

  @cache :tenant_cache
  @topic "lotta:tenant_cache"
  @ttl :timer.seconds(30)

  def start_link(opts \\ []) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    children = [
      {ConCache, name: @cache, ttl_check_interval: :timer.seconds(5), global_ttl: @ttl},
      __MODULE__.Invalidator
    ]

    Supervisor.init(children, strategy: :rest_for_one)
  end

  @doc "Cached `Lotta.Tenants.get_tenant/1`"
  @spec get_tenant(Tenant.id()) :: Tenant.t() | nil
  def get_tenant(id), do: fetch({:id, id}, fn -> Tenants.get_tenant(id) end)

  @doc "Cached `Lotta.Tenants.get_tenant_by_slug/1`"
  @spec get_tenant_by_slug(String.t()) :: Tenant.t() | nil
  def get_tenant_by_slug(slug),
    do: fetch({:slug, slug}, fn -> Tenants.get_tenant_by_slug(slug) end)

  @doc "Cached `Lotta.Tenants.get_by_custom_domain/1`"
  @spec get_by_custom_domain(String.t()) :: Tenant.t() | nil
  def get_by_custom_domain(host),
    do: fetch({:custom_domain, host}, fn -> Tenants.get_by_custom_domain(host) end)

  @doc """
  Remove all cached tenants, on this node right away and on all other nodes
  asynchronously.
  """
  @spec invalidate_all() :: :ok
  def invalidate_all() do
    clear_local()
    Phoenix.PubSub.broadcast_from(Lotta.PubSub, self(), @topic, :invalidate_all)
    :ok
  end

  @doc false
  def clear_local() do
    if cache_running?() do
      @cache
      |> ConCache.ets()
      |> :ets.select([{{:"$1", :_}, [], [:"$1"]}])
      |> Enum.each(&ConCache.delete(@cache, &1))
    end

    :ok
  end

  @doc false
  def topic, do: @topic

  defp fetch(key, loader) do
    if enabled?() and cache_running?() do
      case ConCache.fetch_or_store(@cache, key, fn ->
             case loader.() do
               nil -> {:error, :not_found}
               tenant -> {:ok, tenant}
             end
           end) do
        {:ok, tenant} -> tenant
        {:error, :not_found} -> nil
      end
    else
      loader.()
    end
  end

  defp enabled?(),
    do: Keyword.get(Application.get_env(:lotta, __MODULE__, []), :enabled, true)

  defp cache_running?(), do: is_pid(Process.whereis(@cache))

  defmodule Invalidator do
    @moduledoc false
    # Clears the local cache when another node broadcasts an invalidation.
    use GenServer

    alias Lotta.Tenants.TenantCache

    def start_link(opts), do: GenServer.start_link(__MODULE__, opts, name: __MODULE__)

    @impl true
    def init(_opts) do
      :ok = Phoenix.PubSub.subscribe(Lotta.PubSub, TenantCache.topic())
      {:ok, nil}
    end

    @impl true
    def handle_info(:invalidate_all, state) do
      TenantCache.clear_local()
      {:noreply, state}
    end
  end
end
