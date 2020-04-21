defmodule Api.TenantResolver do
  alias Api.Tenants
  alias Api.Accounts
  alias Api.Accounts.User

  def all(_args, _info) do
    {:ok, Tenants.list_tenants()}
  end

  def get(%{id: id}, _info) do
    {:ok, Tenants.get_tenant!(id)}
  end
  def get(%{slug: slug}, _info) do
    {:ok, Tenants.get_tenant_by_slug(slug)}
  end
  def get(_args, %{context: %{tenant: tenant}}) do
    {:ok, tenant}
  end
  def get(_args, _info) do
    {:ok, nil}
  end

  def create(%{title: title, slug: slug, email: email, name: name}, %{context: %{current_user: current_user}}) do
    if User.is_lotta_admin?(current_user) do
      {:ok, tenant, admin_group} = Tenants.create_tenant(%{title: title, slug: slug})
      user = case Accounts.get_user_by_email(email) do
        nil ->
          password =
            Enum.to_list(?a..?z) ++ Enum.to_list(?0..?9)
            |> Enum.take_random(12)
            |> Enum.join()
          {:ok, user} =
            Accounts.register_user(%{
              email: email,
              name: name,
              password: password,
              tenant_id: tenant.id
            })
          user
        user ->
          user
      end

      Accounts.set_user_groups(user, tenant, [admin_group])
    else
      {:error, "Nur Lotta-Administaren dürfen das"}
    end
  end

  def update(%{tenant: tenant_input}, %{context: %{tenant: tenant} = context}) do
    if context[:current_user] && User.is_admin?(context.current_user, tenant) do
      tenant
      |> Tenants.update_tenant(tenant_input)
    else
      {:error, "Nur Administratoren dürfen das."}
    end
  end
end
