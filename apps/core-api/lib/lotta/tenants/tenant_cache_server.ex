defmodule Lotta.TenantCacheServer do
  use GenServer

  import Ecto.Query

  alias Lotta.Repo
  alias Lotta.Tenants
  alias Lotta.Tenants.Tenant
  alias Lotta.Accounts.{UserGroup, GroupEnrollmentToken}

  @impl true
  def init(_opts) do
    {:ok, init_state()}
  end

  @impl true
  def handle_call({:tenant_lookup, key, value}, _from, {tenants, groups}) do
    {:reply, Enum.find(tenants, &(Map.get(&1, key) == value)), {tenants, groups}}
  end

  @impl true
  def handle_call({:tenant_lookup_domain, host}, _from, {tenants, groups}) do
    {:reply,
     Enum.find(tenants, fn tenant ->
       Enum.any?(tenant.domains, &(&1.host == host))
     end), {tenants, groups}}
  end

  @impl true
  def handle_call(:list, _from, state) do
    {:reply, state, state}
  end

  @impl true
  def handle_call({:group_list, prefix}, _from, {_tenants, groups} = state) do
    {:reply, Map.get(groups, prefix, []), state}
  end

  @impl true
  def handle_cast({:tenant_update, tenant}, {tenants, groups}) do
    {:noreply, {[tenant | Enum.filter(tenants, &(&1.id != tenant.id))], groups}}
  end

  @impl true
  def handle_cast({:group_update, tenant, group}, {tenants, groups}) do
    {:noreply,
     {tenants,
      Map.put(
        groups,
        tenant.prefix,
        [
          group
          | Enum.filter(Map.get(groups, tenant.prefix, []), &(&1.id != group.id))
        ]
      )}}
  end

  @impl true
  def handle_cast({:group_delete, tenant, group}, {tenants, groups}) do
    {:noreply,
     {tenants,
      Map.put(
        groups,
        tenant.prefix,
        [
          Enum.filter(Map.get(groups, tenant.prefix, []), &(&1.id != group.id))
        ]
      )}}
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
    if is_enabled() do
      GenServer.call({:global, __MODULE__}, :tenant_list)
    else
      Repo.all(put_query_prefix(Tenant, "public"))
    end
  end

  @doc """
  Get a tenant by its id
  """
  @doc since: "3.1.0"
  def get_tenant(id) do
    if is_enabled() do
      GenServer.call({:global, __MODULE__}, {:tenant_lookup, :id, id})
    else
      Repo.get(put_query_prefix(Tenant, "public"), id)
    end
  end

  @doc """
  Get a tenant by its slug
  """
  @doc since: "3.1.0"
  def get_tenant_by_slug(slug) do
    if is_enabled() do
      GenServer.call({:global, __MODULE__}, {:tenant_lookup, :slug, slug})
    else
      Repo.one!(
        from(t in Tenant,
          prefix: "public",
          where: t.slug == ^slug
        )
      )
    end
  end

  @doc """
  Get a tenant by a given prefix
  """
  @doc since: "3.1.0"
  def get_tenant_by_prefix(prefix) do
    GenServer.call({:global, __MODULE__}, {:tenant_lookup, :prefix, prefix}) ||
      Repo.one!(
        from(t in Tenant,
          prefix: "public",
          where: t.prefix == ^prefix
        )
      )
  end

  @doc """
  Get a tenant by the host of a given custom domain
  """
  @doc since: "3.1.0"
  def get_tenant_by_custom_domain(host) do
    GenServer.call({:global, __MODULE__}, {:tenant_lookup_domain, host})
  end

  @doc """
  Update the data for a tenant
  """
  @doc since: "3.1.0"
  def update_tenant(tenant) do
    if is_enabled() do
      GenServer.cast({:global, __MODULE__}, {:tenant_update, tenant})
    end
  end

  @doc """
  List all groups for a given tenant
  """
  @doc since: "3.1.0"
  def list_groups(tenant) do
    if is_enabled() do
      GenServer.call({:global, __MODULE__}, {:group_list, tenant.prefix})
    else
      from(g in UserGroup,
        preload: [:enrollment_tokens]
      )
      |> Tenant.put_query_prefix(tenant)
      |> Repo.all()
    end
  end

  @doc """
  List all groups of a given tenant, for which the enrollment_token values
  match. This means the function will return valid groups for a list of tokens.
  """
  @doc since: "3.1.0"
  @spec list_groups_for_tokens(Tenant.t(), list(String.t())) :: list(UserGroup.t())
  def list_groups_for_tokens(tenant, tokens) do
    if is_enabled() do
      list_groups(tenant)
      |> Enum.filter(fn group ->
        Enum.any?(group.enrollment_tokens, fn group_enrollment_token ->
          Enum.any?(tokens, &(group_enrollment_token.token == &1))
        end)
      end)
    else
      from(g in UserGroup,
        join: t in GroupEnrollmentToken,
        on: g.id == t.group_id,
        where: t.token in ^Enum.map(tokens, & &1),
        distinct: true
      )
      |> Repo.all(prefix: tenant.prefix)
    end
  end

  @doc """
  Update the data for a group
  """
  @doc since: "3.1.0"
  def update_group(tenant, group) do
    if is_enabled() do
      GenServer.cast({:global, __MODULE__}, {:group_update, tenant, group})
    end
  end

  @doc """
  Delete a group from cache
  """
  @doc since: "3.1.0"
  def delete_group(tenant, group) do
    if is_enabled() do
      GenServer.cast({:global, __MODULE__}, {:group_delete, tenant, group})
    end
  end

  defp init_tenants_state() do
    if is_enabled() do
      Enum.map(
        Repo.all(
          from t in Tenant,
            prefix: "public",
            preload: [:domains]
        ),
        &Map.put(&1, :configuration, Tenants.get_configuration(&1))
      )
    else
      []
    end
  end

  defp init_groups_state(tenants) do
    Map.new(tenants, fn tenant ->
      {tenant.prefix,
       from(g in UserGroup,
         preload: [:enrollment_tokens]
       )
       |> Tenant.put_query_prefix(tenant)
       |> Repo.all()}
    end)
  end

  defp init_state() do
    tenants = init_tenants_state()
    groups = init_groups_state(tenants)
    {tenants, groups}
  end

  defp is_enabled() do
    Keyword.get(Application.fetch_env!(:lotta, __MODULE__), :enabled, false)
  end
end
