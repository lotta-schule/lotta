defmodule Api.TenantResolver do
  @moduledoc """
    GraphQL Resolver Module for finding, creating, updating and deleting tenants
  """

  alias Ecto.Changeset
  alias ApiWeb.ErrorHelpers
  alias Api.Repo
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

  def create(%{title: title, slug: slug, email: email, name: name}, %{
        context: %{current_user: current_user}
      }) do
    if User.is_lotta_admin?(current_user) do
      Repo.transaction(fn ->
        user =
          case Accounts.get_user_by_email(email) do
            nil ->
              password =
                (Enum.to_list(?a..?z) ++ Enum.to_list(?0..?9))
                |> Enum.take_random(12)
                |> Enum.join()

              {:ok, user} =
                Accounts.register_user(%{
                  email: email,
                  name: name,
                  password: password
                })

              user

            user ->
              user
          end

        with {:ok, tenant} <- Tenants.create_tenant(user, %{title: title, slug: slug}),
             {:ok, _user} <- Repo.update(Changeset.change(user, %{tenant_id: tenant.id})) do
          tenant
        else
          {:error, reason} ->
            Repo.rollback(reason)
        end
      end)
      |> case do
        {:ok, tenant} ->
          {:ok, tenant}

        {:error, changeset} ->
          {:error,
           message: "Lotta konnte nicht erstellt werden",
           details: ErrorHelpers.extract_error_details(changeset)}
      end
    else
      {:error, "Nur Lotta-Administratoren dürfen das."}
    end
  end

  def create(%{title: title, slug: slug}, %{context: %{current_user: current_user}}) do
    current_user_has_admin_groups =
      current_user
      |> User.get_groups()
      |> Enum.any?(& &1.is_admin_group)

    slug =
      slug
      |> String.downcase()
      |> Api.Slugifier.slugify_string()

    if current_user_has_admin_groups do
      {:error, "Der Nutzer ist schon Administrator bei lotta."}
    else
      Repo.transaction(fn ->
        with {:ok, tenant} <- Tenants.create_tenant(current_user, %{title: title, slug: slug}),
             {:ok, user} <- Repo.update(Changeset.change(current_user, %{tenant_id: tenant.id})) do
          Api.Queue.EmailPublisher.send_tenant_creation_email(tenant, user)
          tenant
        else
          {:error, reason} ->
            Repo.rollback(reason)
        end
      end)
      |> case do
        {:ok, tenant} ->
          {:ok, tenant}

        {:error, changeset} ->
          {:error,
           message: "Lotta konnte nicht erstellt werden",
           details: ErrorHelpers.extract_error_details(changeset)}
      end
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
