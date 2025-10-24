defmodule Lotta.Accounts do
  @moduledoc """
  The Accounts context.
  """

  require Logger

  import Ecto.Query

  alias Ecto.{Changeset, Multi}
  alias Lotta.{Content, Eduplaces, Email, Mailer, Repo, Storage}
  alias Lotta.Accounts.{User, UserDevice, UserGroup}
  alias Lotta.Storage.File
  alias Lotta.Tenants.Tenant

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2)
  end

  def query(Category, _params) do
    Category
    |> preload([:groups, :category])
  end

  def query(queryable, _params) do
    queryable
  end

  @doc """
  Returns a list of users.
  """
  @spec list_users() :: [User.t()]
  def list_users() do
    from(u in User,
      order_by: [u.name, u.email]
    )
    |> Repo.all()
  end

  @doc """
  Returns a list of all users either assigned or enrolled into a given group
  """
  @spec list_users_for_group(UserGroup.t(), keyword()) :: [User.t()]
  def list_users_for_group(group, opts \\ []), do: list_users_for_groups([group], opts)

  @doc """
  Returns a list of all users either assigned or enrolled into a given selection
  of multiple groups.
  """
  @spec list_users_for_groups([UserGroup.t()], keyword()) :: [User.t()]
  def list_users_for_groups(groups, opts \\ []) do
    {assigned_users, group_ids} =
      groups
      |> Enum.reduce({[], []}, fn group, {users, group_ids} ->
        {
          users ++ Repo.preload(group, :users).users,
          [group.id | group_ids]
        }
      end)

    enrolled_users =
      from(u in User,
        join: ug in UserGroup,
        on: fragment("? && ?", ug.enrollment_tokens, u.enrollment_tokens),
        where: ug.id in ^group_ids,
        preload: [:devices]
      )
      |> Repo.all(opts)

    assigned_users
    |> Enum.concat(enrolled_users)
    |> Enum.uniq_by(& &1.id)
  end

  @doc """
  Returns a list of all users not in any group – neither assigned nor enrolled via token.
  """
  @doc since: "4.2.0"
  @spec list_users_without_groups() :: [User.t()]
  def list_users_without_groups() do
    not_assigned_users_query =
      from(u in User,
        left_join: uug in "user_user_group",
        on: u.id == uug.user_id,
        where: is_nil(uug.user_group_id)
      )

    from(u in subquery(not_assigned_users_query),
      left_join: ug in UserGroup,
      on: fragment("? && ?", ug.enrollment_tokens, u.enrollment_tokens),
      where: is_nil(ug.id)
    )
    |> Repo.all()
  end

  @doc """
  Returns list of all users that are member of at least one administrator group.
  """
  @spec list_admin_users(tenant :: Tenant.t() | nil) :: [User.t()]
  def list_admin_users(tenant \\ nil) do
    opts = if tenant, do: [prefix: tenant.prefix], else: []

    from(u in User,
      join: ug in assoc(u, :groups),
      where: ug.is_admin_group == true,
      order_by: [u.name, u.email],
      distinct: true
    )
    |> Repo.all(opts)
  end

  @doc """
  Gets a single user.

  Returns nil if the User does not exist.

  """
  @spec get_user(User.id()) :: User.t() | nil
  def get_user(id) do
    Repo.get(User, id)
  end

  @doc """
  Gets a single user by email.

  returns nil if the User does not exist.
  """
  @spec get_user_by_email(User.email()) :: User.t() | nil
  def get_user_by_email(email) do
    Repo.get_by(User, email: email)
  end

  @doc """
  Gets a single user by eduplaces_id.

  Returns nil if the User does not exist.
  """
  @doc since: "6.1.0"
  @spec get_user_by_eduplaces_id(String.t()) :: User.t() | nil
  def get_user_by_eduplaces_id(eduplaces_id) do
    Repo.get_by(User, eduplaces_id: eduplaces_id)
  end

  @doc """
  Gets multiple users by their eduplaces_ids.

  Returns a list of users. Users that don't exist are not included.
  """
  @doc since: "6.1.0"
  @spec list_users_by_eduplaces_ids([String.t()]) :: [User.t()]
  def list_users_by_eduplaces_ids(eduplaces_ids) when is_list(eduplaces_ids) do
    from(u in User,
      where: u.eduplaces_id in ^eduplaces_ids
    )
    |> Repo.all()
  end

  @doc """
  Searches users by text. The user is searched by *exact match* of email, or by name or nickname
  """
  @spec search_user(String.t(), [String.t()] | nil, {:before | :after, DateTime.t()} | nil) :: [
          User.t()
        ]
  def search_user(searchtext, group_ids, last_seen) do
    from(u in User)
    |> search_user_apply_searchtext_filter(searchtext)
    |> search_user_apply_group_ids_filter(group_ids)
    |> search_user_apply_last_seen_filter(last_seen)
    |> Repo.all()
  end

  defp search_user_apply_searchtext_filter(query, searchtext) when is_nil(searchtext), do: query

  defp search_user_apply_searchtext_filter(query, searchtext) do
    matching_searchtext = "%#{searchtext}%"

    from(u in query,
      where:
        u.email == ^searchtext or
          ilike(u.name, ^matching_searchtext) or
          ilike(u.nickname, ^matching_searchtext)
    )
  end

  defp search_user_apply_group_ids_filter(query, group_ids) when is_nil(group_ids), do: query

  defp search_user_apply_group_ids_filter(query, group_ids) do
    has_nil_group = Enum.any?(group_ids, &is_nil/1)

    group_ids_without_nil = Enum.reject(group_ids, &is_nil/1)

    user_ids =
      from(g in UserGroup,
        where: g.id in ^group_ids_without_nil,
        preload: :users
      )
      |> Repo.all()
      |> list_users_for_groups()
      |> Enum.map(& &1.id)
      |> then(fn user_ids ->
        if has_nil_group do
          user_ids ++ Enum.map(list_users_without_groups(), & &1.id)
        else
          user_ids
        end
      end)

    from(
      u in query,
      where: u.id in ^user_ids
    )
  end

  defp search_user_apply_last_seen_filter(query, {:after, last_seen}),
    do: from(u in query, where: u.last_seen < ^last_seen)

  defp search_user_apply_last_seen_filter(query, {:before, last_seen}),
    do: from(u in query, where: u.last_seen > ^last_seen)

  defp search_user_apply_last_seen_filter(query, last_seen) when is_nil(last_seen), do: query

  @doc """
  Updates a user by an admin.
  This is to assign groups.
  See `Lotta.Accounts.update_profile/2` if you want to change your own user's data.
  See `Lotta.Accounts.User.update_changeset/2` to see the changeset in use.
  """
  @spec update_user(User.t(), map()) :: {:ok, User.t()} | {:error, Changeset.t()}
  def update_user(%User{} = user, attrs) do
    user
    |> User.update_changeset(attrs)
    |> Repo.update(prefix: Ecto.get_meta(user, :prefix))
  end

  @doc """
  Update a user's profile.
  This is for profile data like image, name, ...
  See `Lotta.Accounts.User.update_profile_changeset/2` to see the changeset in use.
  """
  @spec update_profile(User.t(), map()) :: {:ok, User.t()} | {:error, Changeset.t()}
  def update_profile(%User{} = user, attrs) do
    user
    |> User.update_profile_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  List all available user groups
  """
  @spec list_user_groups() :: [UserGroup.t()]
  def list_user_groups() do
    Repo.all(from(UserGroup, order_by: [{:desc, :sort_key}, {:desc, :is_admin_group}]))
  end

  @doc """
  Get groups which have a given enrollment token
  """
  @spec list_groups_for_enrollment_token(String.t()) :: [UserGroup.t()]
  def list_groups_for_enrollment_token(token) when is_binary(token) do
    from(g in UserGroup,
      where: not is_nil(fragment("array_position(?, ?)", g.enrollment_tokens, ^token))
    )
    |> Repo.all(prefix: Repo.get_prefix())
  end

  @doc """
  Get groups which have given enrollment tokens.
  If no tenant is passed to the function, the current
  process' tenant will be taken.
  """
  @spec list_groups_for_enrollment_tokens([String.t()], Tenant.t() | nil) :: [
          UserGroup.t()
        ]
  def list_groups_for_enrollment_tokens(tokens, tenant \\ nil) when is_list(tokens) do
    prefix = if tenant, do: tenant.prefix, else: Repo.get_prefix()

    from(g in UserGroup,
      where: fragment("? && ?", g.enrollment_tokens, ^tokens)
    )
    |> Repo.all(prefix: prefix)
  end

  @doc """
  Registers a user via email, generating a first-time password.
  If successfull, returns a user and a password.
  """
  @spec register_user_by_mail(Tenant.t(), map()) ::
          {:ok, User.t()} | {:error, Changeset.t()}
  def register_user_by_mail(tenant, attrs) do
    pw_length = 8

    generated_pw =
      :crypto.strong_rand_bytes(pw_length)
      |> Base.url_encode64()
      |> binary_part(0, pw_length)

    attrs = Map.put(attrs, :password, generated_pw)

    changeset =
      %User{}
      |> Ecto.put_meta(prefix: tenant.prefix)
      |> User.registration_changeset(attrs)

    case Repo.insert(changeset) do
      {:ok, user} ->
        Storage.create_new_user_directories(user)

        {:ok, Map.put(user, :password, generated_pw)}

      result ->
        result
    end
  end

  @doc """
    Find a user with the given Eduplaces user info.
    If the user does not exist, it will be created.
  """
  @doc since: "6.1.0"
  @spec get_or_create_eduplaces_user(Tenant.t(), Eduplaces.UserInfo.t()) ::
          {:ok, User.t()} | {:error, Changeset.t()}
  def get_or_create_eduplaces_user(tenant, %{id: eduplaces_id} = user_info) do
    if user =
         Repo.one(
           from(u in User,
             where: u.eduplaces_id == ^eduplaces_id
           )
         ) do
      {:ok, user}
    else
      register_eduplaces_user(tenant, user_info)
    end
  end

  @doc """
  Registers a user via eduplaces user info.
  The user will have no password set, as it is not needed for eduplaces users.
  """
  @doc since: "6.1.0"
  @spec register_eduplaces_user(Tenant.t(), Eduplaces.UserInfo.t()) ::
          {:ok, User.t(), String.t()} | {:error, Changeset.t()}
  def register_eduplaces_user(tenant, user_info) do
    groups =
      case Enum.map(user_info.groups, & &1.id) do
        [] ->
          []

        group_ids ->
          Repo.all(
            from(g in UserGroup,
              where: g.eduplaces_id in ^group_ids
            )
          )
      end

    user_info
    |> Eduplaces.UserInfo.to_lotta_user()
    |> User.update_changeset(groups: groups)
    |> Repo.insert(prefix: tenant.prefix)
    |> case do
      {:ok, user} ->
        Storage.create_new_user_directories(user)
        {:ok, user}

      {:error, changeset} ->
        {:error, changeset}
    end
  end

  @doc """
  Deletes a User.
  """
  @spec delete_user(User.t()) :: {:ok, User.t()} | {:error, Changeset.t()}
  def delete_user(%User{} = user) do
    # delete every file manually so that the files are deleted
    # this should probably be merged to a genserver / bg job of some kind
    from(f in File, where: f.user_id == ^user.id)
    |> Repo.all()
    |> Enum.each(&Storage.delete_file/1)

    result = Repo.delete(user)

    if Kernel.match?({:ok, _}, result) do
      Mailer.deliver_later(Email.account_closed_mail(user))
    end

    result
  end

  @doc """
  Request a password reset.
  If a user exists for the given email address,
  this creates a reset token with 6 hours validity and sends it to the user.
  If a user does not exist, {:error, :not_found} is returned.
  If a user exists, {:ok, User} is returned.
  Any error from redis is related.
  """
  @spec request_password_reset(User.email()) :: {:ok, User.t()} | {:error, term()}
  def request_password_reset(email) do
    user =
      Repo.one(
        from(u in User,
          where: fragment("lower(?)", u.email) == ^String.downcase(email)
        )
      )

    if is_nil(user) do
      {:error, :not_found}
    else
      token =
        :crypto.strong_rand_bytes(32)
        |> Base.url_encode64(padding: false)
        |> URI.encode()

      prefix = Ecto.get_meta(user, :prefix)

      with {:ok, _res} <-
             Redix.command(:redix, [
               "SET",
               "#{prefix}---user-email-verify-token-#{user.email}",
               token,
               "EX",
               6 * 60 * 60
             ]),
           {:ok, _mail} <-
             user
             |> Lotta.Email.request_password_reset_mail(token)
             |> Mailer.deliver_later() do
        {:ok, user}
      else
        error ->
          Logger.error(inspect(error))
          Sentry.capture_message(inspect(error), extra: %{prefix: prefix, email: email})

          error
      end
    end
  end

  @doc """
  If a given token exists for a given email,
  the corresponding user is returned and the token is invalidated so it cannot be reused.
  Returns {:error, :invalid_token} if no valid email / token pair is found.
  """
  @spec find_user_by_reset_token(User.email(), String.t()) ::
          {:ok, User.t()} | {:error, :invalid_token}
  def find_user_by_reset_token(email, token) do
    prefix = Repo.get_prefix()
    key = "#{prefix}---user-email-verify-token-#{email}"

    case Redix.command(:redix, ["GET", key]) do
      {:ok, reset_token} when not is_nil(reset_token) ->
        user = Repo.get_by(User, email: email)

        if token == reset_token and not is_nil(user) do
          Redix.command(:redix, ["DEL", key])
          {:ok, user}
        else
          Logger.warning("User, token and reset token do not match for #{email}")
          {:error, :invalid_token}
        end

      error ->
        Logger.error(inspect(error))
        Sentry.capture_message(inspect(error), extra: %{email: email, prefix: prefix})
        {:error, :invalid_token}
    end
  end

  @doc """
  Update a user's password.
  Notify the user if successfull.
  """
  @spec update_password(User.t(), String.t()) :: {:ok, User.t()} | {:error, Changeset.t()}
  def update_password(%User{} = user, password)
      when is_binary(password) and byte_size(password) > 0 do
    user =
      user
      |> User.update_password_changeset(password)

    case Repo.update(user) do
      {:ok, user} ->
        Lotta.Email.password_changed_mail(user)
        |> Mailer.deliver_now()

        {:ok, user}

      result ->
        result
    end
  end

  @doc """
  Update a user's email.
  Notify the user if successfull.
  """
  @doc since: "2.4.0"
  @spec update_email(User.t(), String.t()) :: {:ok, User.t()} | {:error, Changeset.t()}
  def update_email(%User{} = user, email)
      when is_binary(email) and byte_size(email) > 0 do
    user
    |> User.update_email_changeset(email)
    |> Repo.update()
  end

  @doc """
  Gets a single user group.

  Raises `Ecto.NoResultsError` if the UserGroup does not exist.
  """
  @spec get_user_group(pos_integer()) :: UserGroup.t() | nil
  def get_user_group(id) do
    Repo.get(UserGroup, id)
  end

  @doc """
  Creates a group.
  """
  @spec create_user_group(map()) :: {:ok, UserGroup.t()} | {:error, Changeset.t()}
  def create_user_group(attrs) do
    attrs =
      case attrs do
        %{sort_key: _} ->
          attrs

        attrs ->
          attrs
          |> Map.put(:sort_key, UserGroup.get_max_sort_key() + 10)
      end

    UserGroup.create_changeset(attrs)
    |> Repo.insert(prefix: Repo.get_prefix())
  end

  @doc """
  Updates a group.
  """
  @spec update_user_group(UserGroup.t(), map()) :: {:ok, UserGroup.t()} | {:error, Changeset.t()}
  def update_user_group(%UserGroup{} = group, attrs) do
    group
    |> UserGroup.update_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Sets the members of a group by replacing all current members with the given list of users.
  Any users not in the given list will be removed from the group.
  """
  @doc since: "6.1.0"
  @spec set_group_members(UserGroup.t(), [User.t()]) ::
          {:ok, UserGroup.t()} | {:error, Changeset.t()}
  def set_group_members(%UserGroup{} = group, users) when is_list(users) do
    group
    |> Repo.preload(:users)
    |> Changeset.change()
    |> Changeset.put_assoc(:users, users)
    |> Repo.update()
  end

  @doc """
  Deletes a Group.

  This will also make all articles which had only this group assigned to be set back to the "draft" state,
  as they would otherwise be without any group assigned, which would lead them to be visible to everyone.
  """
  @spec delete_user_group(UserGroup.t()) :: {:ok, UserGroup.t()} | {:error, Changeset.t()}
  def delete_user_group(%UserGroup{} = group) do
    Multi.new()
    |> Multi.run(
      :unpublished_articles,
      fn _, _ ->
        Content.unpublish_articles_of_single_group(group)
      end
    )
    |> Multi.delete(:user_group, group)
    |> Repo.transaction()
  end

  @doc """
  Sets the 'last seen' property on a user
  """
  @spec see_user(User.t()) :: {:ok, UserGroup.t()} | {:error, Changeset.t()}
  def see_user(%User{} = user) do
    user
    |> Changeset.change(%{
      last_seen: DateTime.truncate(DateTime.utc_now(), :second)
    })
    |> Repo.update(prefix: Ecto.get_meta(user, :prefix))
  end

  @doc """
  Gets all devices for a specific user
  """
  @doc since: "4.1.0"
  @spec list_devices(User.t()) :: [UserDevice.t()]
  def list_devices(user) do
    user
    |> Repo.preload(:devices)
    |> Map.get(:devices)
  end

  @doc """
  Gets specific device for a specific user
  """
  @doc since: "4.1.0"
  @spec get_device(UserDevice.id()) ::
          UserDevice.t() | nil
  def get_device(id) do
    Repo.get(UserDevice, id)
  end

  @doc """
  Creates a Device for a given user.
  """
  @doc since: "4.1.0"
  @spec register_device(User.t(), map(), keyword()) ::
          {:ok, UserDevice.t()} | {:error, Changeset.t()}
  def register_device(user, attrs, opts \\ []) do
    user
    |> Repo.build_prefixed_assoc(:devices)
    |> UserDevice.changeset(attrs)
    |> Repo.insert(
      Keyword.merge(
        [
          on_conflict: [set: [last_used: DateTime.utc_now(), user_id: user.id]],
          conflict_target: :push_token,
          returning: true
        ],
        opts
      )
    )
  end

  @doc """
  Updates a Device.
  """
  @doc since: "4.1.0"
  @spec update_device(UserDevice.t(), map()) ::
          {:ok, UserDevice.t()} | {:error, Changeset.t()}
  def update_device(device, attrs) do
    device
    |> UserDevice.update_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Device.
  """
  @doc since: "4.1.0"
  @spec delete_device(UserDevice.t()) ::
          {:ok, UserDevice.t()} | {:error, Changeset.t()}
  def delete_device(device) do
    Repo.delete(device)
  end
end
