defmodule Api.Accounts do
  @moduledoc """
  The Accounts context.
  """

  require Logger
  import Ecto.Query
  alias Api.Repo
  alias Api.Tenants
  alias Api.Queue.EmailPublisher

  alias Api.Accounts.{
    BlockedTenant,
    User,
    UserGroup,
    GroupEnrollmentToken,
    UserEnrollmentToken,
    Directory,
    File,
    FileConversion
  }

  alias Api.Tenants.Tenant

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2)
  end

  def query(queryable, _params) do
    queryable
  end

  @doc """
  Returns the list of users.

  ## Examples

      iex> list_users_with_groups(1)
      [%User{}, ...]

  """
  def list_users_with_groups(tenant_id) do
    assigned_groups_query =
      from u in User,
        join: g in assoc(u, :groups),
        where: g.tenant_id == ^tenant_id,
        distinct: true

    dynamic_groups_query =
      from u in User,
        join: g in UserGroup,
        join: ut in UserEnrollmentToken,
        on: ut.user_id == u.id,
        join: t in GroupEnrollmentToken,
        on: g.id == t.group_id and t.token == ut.enrollment_token,
        distinct: true

    query =
      from q in subquery(union(assigned_groups_query, ^dynamic_groups_query)),
        order_by: [q.name, q.email]

    Repo.all(query)
  end

  @doc """
  Gets a single user.

  Raises `Ecto.NoResultsError` if the User does not exist.

  ## Examples

      iex> get_user!(123)
      %User{}

      iex> get_user!(456)
      ** (Ecto.NoResultsError)

  """
  def get_user!(id) do
    Repo.get!(User, id)
  end

  @doc """
  Gets a single user by email.

  returns nil if the User does not exist.

  ## Examples

      iex> get_user_by_email("test@test.de")
      %User{}

      iex> get_user_by_email("test@no.de")
      nil

  """
  def get_user_by_email(email) do
    Repo.get_by(User, email: email)
  end

  @doc """
  Searches users by text. The user is searched by *exact match* of email, or, in the same tenant, by name or nickname

  ## Examples

      iex> search_user("vader", %Tenant{id: 1})
      [%User{}]
  """
  def search_user(searchtext, tenant) do
    tenant_id = tenant.id
    matching_searchtext = "%#{searchtext}%"

    query =
      Ecto.Query.from(u in User,
        where:
          u.email == ^searchtext or
            (u.tenant_id == ^tenant_id and
               (ilike(u.name, ^matching_searchtext) or ilike(u.nickname, ^matching_searchtext)))
      )

    {:ok, Repo.all(query)}
  end

  @doc """
  Creates a user.

  ## Examples

      iex> create_user(%{field: value})
      {:ok, %User{}}

      iex> create_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a user.

  ## Examples

      iex> update_user(user, %{field: new_value})
      {:ok, %User{}}

      iex> update_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_user(%User{} = user, attrs) do
    user
    |> User.update_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Assigns a group to a user

  ## Examples

      iex> set_user_groups(user, tenant, %{field: new_value})
      {:ok, %User{}}

      iex> set_user_groups(user, tenant, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def set_user_groups(%User{} = user, %Tenant{} = tenant, groups) do
    groups =
      user
      |> Repo.preload(:groups)
      |> Map.fetch!(:groups)
      |> Enum.filter(fn group -> group.tenant_id !== tenant.id end)
      |> Enum.concat(groups)

    user
    |> Repo.preload(:groups)
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:groups, groups)
    |> Repo.update()
  end

  @doc """
  Get groups which have a given enrollment token

  """
  def get_groups_by_enrollment_token(%Tenant{} = tenant, token) when is_binary(token) do
    from(g in UserGroup,
      join: t in GroupEnrollmentToken,
      on: g.id == t.group_id,
      where: t.token == ^token and g.tenant_id == ^tenant.id,
      distinct: true
    )
    |> Repo.all()
  end

  @doc """
  Get groups which have given enrollment tokens

  """
  def get_groups_by_enrollment_tokens(%Tenant{} = tenant, tokens) when is_list(tokens) do
    from(g in UserGroup,
      join: t in GroupEnrollmentToken,
      on: g.id == t.group_id,
      where: t.token in ^tokens and g.tenant_id == ^tenant.id,
      distinct: true
    )
    |> Repo.all()
  end

  @doc """
  Registers a user.

  ## Examples

      iex> register_user(%{field: new_value})
      {:ok, %User{}}

      iex> register_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def register_user(attrs) do
    changeset =
      %User{}
      |> User.registration_changeset(attrs)

    case Repo.insert(changeset) do
      {:ok, user} ->
        user
        |> create_new_user_directories()

        {:ok, user}

      result ->
        result
    end
  end

  @doc """
  Deletes a User.

  ## Examples

      iex> delete_user(user)
      {:ok, %User{}}

      iex> delete_user(user)
      {:error, %Ecto.Changeset{}}

  """
  def delete_user(%User{} = user) do
    Repo.delete(user)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking user changes.

  ## Examples

      iex> change_user(user)
      %Ecto.Changeset{source: %User{}}

  """
  def change_user(%User{} = user) do
    User.changeset(user, %{})
  end

  def request_password_reset_token(email, token) do
    case Repo.get_by(User, email: email) do
      nil ->
        {:error, "User not found"}

      user ->
        case Redix.command(:redix, [
               "SET",
               "user-email-verify-token-#{email}",
               token,
               "EX",
               6 * 60 * 60
             ]) do
          {:ok, _} ->
            {:ok, user}

          error ->
            error
        end
    end
  end

  def find_user_by_reset_token(email, token) do
    with {:ok, reset_token} <- Redix.command(:redix, ["GET", "user-email-verify-token-#{email}"]),
         false <- is_nil(token),
         true <- token == reset_token,
         user <- Repo.get_by(User, email: email),
         false <- is_nil(user) do
      Redix.command(:redix, ["DEL", "user-email-verify-token-#{email}"])
      {:ok, user}
    else
      error ->
        Logger.error(inspect(error))
        {:error, :invalid_token}
    end
  end

  def update_password(%User{} = user, password)
      when is_binary(password) and byte_size(password) > 0 do
    user =
      user
      |> User.update_password_changeset(password)

    case Repo.update(user) do
      {:ok, user} ->
        EmailPublisher.send_password_changed_email(user)
        {:ok, user}

      e = {:error, reason} ->
        Logger.error("Error updating user password: #{reason}")
        e
    end
  end

  def set_user_blocked(%User{} = user, %Tenant{} = tenant, true) do
    user = Repo.preload(user, :blocked_tenants)

    blocked_tenants =
      Enum.filter(user.blocked_tenants, fn blocked_tenant ->
        blocked_tenant.tenant_id != tenant.id
      end) ++ [%BlockedTenant{user_id: user.id, tenant_id: tenant.id}]

    user
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:blocked_tenants, blocked_tenants)
    |> Repo.update()
  end

  def set_user_blocked(%User{} = user, %Tenant{} = tenant, false) do
    user = Repo.preload(user, :blocked_tenants)

    blocked_tenants =
      Enum.filter(user.blocked_tenants, fn blocked_tenant ->
        blocked_tenant.tenant_id != tenant.id
      end)

    user
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:blocked_tenants, blocked_tenants)
    |> Repo.update()
  end

  @doc """
  List root directories for a user and tenant

  """
  def list_root_directories(%Tenant{} = tenant, %User{} = user) do
    from(d in Directory,
      where:
        d.tenant_id == ^tenant.id and is_nil(d.parent_directory_id) and
          (d.user_id == ^user.id or is_nil(d.user_id)),
      order_by: [fragment("? DESC NULLS LAST", d.user_id), :name]
    )
    |> Repo.all()
  end

  @doc """
  List root directories for a user and tenant

  """
  def list_directories(%Directory{} = directory) do
    from(d in Directory,
      where: d.parent_directory_id == ^directory.id,
      order_by: [:name]
    )
    |> Repo.all()
  end

  @doc """
  Gets a single directory.

  returns nil if the Directory does not exist

  ## Examples

      iex> get_directory(123)
      %File{}

      iex> get_directory(456)
      nil

  """
  def get_directory(id), do: Repo.get(Directory, id)

  @doc """
  Gets a single file.

  Raises `Ecto.NoResultsError` if the File does not exist.

  ## Examples

      iex> get_directory!(123)
      %File{}

      iex> get_directory!(456)
      ** (Ecto.NoResultsError)

  """
  def get_directory!(id), do: Repo.get!(Directory, id)

  @doc """
  Creates a Directory.

  ## Examples

      iex> create_directory(%{field: value})
      {:ok, %Directory{}}

      iex> create_directory(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_directory(attrs) do
    %Directory{}
    |> Directory.changeset(attrs)
    |> Repo.insert()
  end

  def create_new_user_directories(%User{} = user) do
    Tenants.list_tenants()
    |> Enum.map(fn tenant ->
      create_user_default_directories(user, tenant)
    end)
  end

  def create_user_default_directories(%User{} = user, %Tenant{} = tenant) do
    ["Mein Profil", "Meine Bilder", "Meine Dokumente", "Meine Videos", "Meine Tondokumente"]
    |> Enum.map(fn name ->
      create_directory(%{
        name: name,
        user_id: user.id,
        tenant_id: tenant.id
      })
    end)
  end

  @doc """
  Updates a directory.

  ## Examples

      iex> update_directory(directory, path)
      {:ok, %Directory{}}

  """
  def update_directory(%Directory{} = directory, attrs) do
    directory
    |> Directory.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Directory.

  ## Examples

      iex> delete_directory(directory)
      {:ok, %Directory{}}

      iex> delete_directory(directory)
      {:error, %Ecto.Changeset{}}

  """
  def delete_directory(%Directory{} = directory) do
    Repo.delete(directory)
  end

  @doc """
  Returns the list of files.

  ## Examples

      iex> list_files()
      [%File{}, ...]

  """
  def list_files(%Directory{} = parent_directory) do
    Ecto.Query.from(f in File,
      where: f.parent_directory_id == ^parent_directory.id,
      order_by: [:filename]
    )
    |> Repo.all()
  end

  @doc """
  Gets a single file.

  Raises `Ecto.NoResultsError` if the File does not exist.

  ## Examples

      iex> get_file!(123)
      %File{}

      iex> get_file!(456)
      ** (Ecto.NoResultsError)

  """
  def get_file!(id), do: Repo.get!(File, id)

  @doc """
  Creates a file.

  ## Examples

      iex> create_file(%{field: value})
      {:ok, %File{}}

      iex> create_file(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_file(attrs) do
    %File{}
    |> File.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a file.

  ## Examples

      iex> update_file(file, path)
      {:ok, %File{}}

  """
  def update_file(%File{} = file, attrs) do
    file
    |> File.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a File.

  ## Examples

      iex> delete_file(file)
      {:ok, %File{}}

      iex> delete_file(file)
      {:error, %Ecto.Changeset{}}

  """
  def delete_file(%File{} = file) do
    Repo.delete(file)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking file changes.

  ## Examples

      iex> change_file(file)
      %Ecto.Changeset{source: %File{}}

  """
  def change_file(%File{} = file) do
    File.changeset(file, %{})
  end

  @doc """
  Returns the list of file_conversions.

  ## Examples

      iex> list_file_conversions()
      [%FileConversion{}, ...]

  """
  def list_file_conversions do
    Repo.all(FileConversion)
  end

  @doc """
  Gets a single file_conversion.

  Raises `Ecto.NoResultsError` if the File conversion does not exist.

  ## Examples

      iex> get_file_conversion!(123)
      %FileConversion{}

      iex> get_file_conversion!(456)
      ** (Ecto.NoResultsError)

  """
  def get_file_conversion!(id), do: Repo.get!(FileConversion, id)

  @doc """
  Creates a file_conversion.

  ## Examples

      iex> create_file_conversion(%{field: value})
      {:ok, %FileConversion{}}

      iex> create_file_conversion(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_file_conversion(attrs \\ %{}) do
    %FileConversion{}
    |> FileConversion.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a file_conversion.

  ## Examples

      iex> update_file_conversion(file_conversion, %{field: new_value})
      {:ok, %FileConversion{}}

      iex> update_file_conversion(file_conversion, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_file_conversion(%FileConversion{} = file_conversion, attrs) do
    file_conversion
    |> FileConversion.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a FileConversion.

  ## Examples

      iex> delete_file_conversion(file_conversion)
      {:ok, %FileConversion{}}

      iex> delete_file_conversion(file_conversion)
      {:error, %Ecto.Changeset{}}

  """
  def delete_file_conversion(%FileConversion{} = file_conversion) do
    Repo.delete(file_conversion)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking file_conversion changes.

  ## Examples

      iex> change_file_conversion(file_conversion)
      %Ecto.Changeset{source: %FileConversion{}}

  """
  def change_file_conversion(%FileConversion{} = file_conversion) do
    FileConversion.changeset(file_conversion, %{})
  end

  @doc """
  Gets a single user group.

  Raises `Ecto.NoResultsError` if the UserGroup does not exist.

  ## Examples

      iex> get_user_group!(123)
      %UserGroup{}

      iex> get_user_group!(456)
      ** (Ecto.NoResultsError)

  """
  def get_user_group!(id) do
    Repo.get!(UserGroup, id)
  end

  @doc """
  Creates a group.

  ## Examples

      iex> create_user_group(tenant, user_group)
      {:ok, %UserGroup{}}

      iex> create_user_group(tenant, user_group)
      {:error, %Ecto.Changeset{}}

  """
  def create_user_group(%Tenant{} = tenant, attrs) do
    attrs =
      case attrs do
        %{sort_key: _} ->
          attrs

        attrs ->
          attrs
          |> Map.put(:sort_key, UserGroup.get_max_sort_key(tenant) + 10)
      end

    tenant
    |> Ecto.build_assoc(:groups)
    |> UserGroup.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a group.

  ## Examples

      iex> update_user_group(user_group, %{field: new_value})
      {:ok, %User{}}

      iex> update_user_group(user_group, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_user_group(%UserGroup{} = group, attrs) do
    group
    |> UserGroup.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Group.

  ## Examples

      iex> delete_user_group(user_group)
      {:ok, %UserGroup{}}

      iex> delete_user_group(user_group)
      {:error, %Ecto.Changeset{}}

  """
  def delete_user_group(%UserGroup{} = group) do
    Repo.delete(group)
  end

  @doc """
  Sets the 'last seen' property on a user

  ## Examples

      iex> see_user(user)
      %User{}

  """
  def see_user(%User{} = user) do
    user
    |> Ecto.Changeset.change(%{
      last_seen: NaiveDateTime.truncate(NaiveDateTime.utc_now(), :second)
    })
    |> Repo.update!()
  end
end
