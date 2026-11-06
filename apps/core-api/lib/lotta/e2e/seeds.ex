defmodule Lotta.E2E.Seeds do
  @moduledoc """
  Creates test data in a tenant for the end-to-end test suite (`apps/e2e`).

  Only reachable through `/admin/api/seed`, which is disabled unless
  `ENABLE_E2E_API` is set.
  """

  import Ecto.Query

  alias Ecto.Multi
  alias Lotta.{Accounts, Repo}
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Tenants.Tenant

  @type group_params :: %{
          required(:name) => String.t(),
          optional(:is_admin_group) => boolean(),
          optional(:enrollment_tokens) => [String.t()]
        }

  @type user_params :: %{
          required(:name) => String.t(),
          required(:email) => String.t(),
          optional(:password) => String.t() | nil,
          optional(:nickname) => String.t(),
          optional(:class) => String.t(),
          optional(:groups) => [String.t()]
        }

  @type result :: %{
          groups: [UserGroup.t()],
          users: [User.t()]
        }

  @doc """
  Seeds groups and users into the given tenant.

  - Groups are matched by name. Existing groups are reused, missing ones are created.
  - Users reference groups by name. Groups created by the default content
    ("Lehrer", "Schüler", "Administrator") can be used as well.
  - Users with a `password` can log in with it right away. Users without one get a
    generated first-time password (returned in the result) and are asked to change
    it on first login, just like users created by an administrator.
  """
  @spec seed(Tenant.t(), %{
          optional(:groups) => [group_params()],
          optional(:users) => [user_params()]
        }) :: {:ok, result()} | {:error, Ecto.Changeset.t() | String.t()}
  def seed(%Tenant{prefix: prefix} = tenant, params) do
    groups_params = Map.get(params, :groups, [])
    users_params = Map.get(params, :users, [])

    Multi.new()
    |> Multi.run(:groups, fn _repo, _changes ->
      map_ok(groups_params, &get_or_create_group(prefix, &1))
    end)
    |> Multi.run(:users, fn _repo, _changes ->
      map_ok(users_params, &create_user(tenant, &1))
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{groups: groups, users: users}} ->
        {:ok, %{groups: groups, users: users}}

      {:error, _step, reason, _changes} ->
        {:error, reason}
    end
  end

  defp get_or_create_group(prefix, %{name: name} = params) do
    case Repo.one(from(g in UserGroup, where: g.name == ^name), prefix: prefix) do
      nil ->
        max_sort_key =
          Repo.one(from(g in UserGroup, select: max(g.sort_key)), prefix: prefix) || 0

        params
        |> Map.take([:name, :is_admin_group, :enrollment_tokens])
        |> Map.put(:sort_key, max_sort_key + 10)
        |> UserGroup.create_changeset()
        |> Repo.insert(prefix: prefix)

      group ->
        {:ok, group}
    end
  end

  defp create_user(%Tenant{prefix: prefix} = tenant, params) do
    with {:ok, groups} <- find_groups(prefix, Map.get(params, :groups, [])),
         {:ok, user} <-
           Accounts.register_user_by_mail(
             tenant,
             Map.take(params, [:name, :email, :nickname, :class])
           ),
         generated_password = user.password,
         {:ok, user} <- maybe_set_password(user, prefix, Map.get(params, :password)),
         {:ok, user} <-
           user
           |> User.update_changeset(%{groups: groups})
           |> Repo.update(prefix: prefix) do
      {:ok, Map.put(user, :password, Map.get(params, :password) || generated_password)}
    end
  end

  defp maybe_set_password(user, _prefix, nil), do: {:ok, user}

  defp maybe_set_password(user, prefix, password) do
    user
    |> User.update_password_changeset(password)
    |> Repo.update(prefix: prefix)
  end

  defp find_groups(prefix, names) do
    groups = Repo.all(from(g in UserGroup, where: g.name in ^names), prefix: prefix)

    case names -- Enum.map(groups, & &1.name) do
      [] -> {:ok, groups}
      missing -> {:error, "Unknown groups: #{Enum.join(missing, ", ")}"}
    end
  end

  defp map_ok(list, fun) do
    Enum.reduce_while(list, {:ok, []}, fn item, {:ok, acc} ->
      case fun.(item) do
        {:ok, result} -> {:cont, {:ok, [result | acc]}}
        error -> {:halt, error}
      end
    end)
    |> case do
      {:ok, results} -> {:ok, Enum.reverse(results)}
      error -> error
    end
  end
end
