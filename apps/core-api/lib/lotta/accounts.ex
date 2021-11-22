defmodule Lotta.Accounts do
  @moduledoc """
  The Accounts context.
  """

  require Logger

  import Ecto.Query

  alias Ecto.Changeset
  alias Lotta.Repo
  alias Lotta.Mailer
  alias Lotta.Accounts.{User, UserGroup, GroupEnrollmentToken}
  alias Lotta.Storage
  alias Lotta.Storage.{File}

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2)
  end

  def query(queryable, _params) do
    queryable
  end

  @doc """
  Returns the list of users.

  ## Examples

      iex> list_users()
      [%User{}, ...]

  """
  @spec list_users() :: [User.t()]
  def list_users() do
    from(u in User,
      order_by: [u.name, u.email]
    )
    |> Repo.all()
  end

  @doc """
  Returns list of all users that are member of at least one administrator group.

  ## Examples
    iex> list_admin_users()
    [%User{}, ...]
  """
  @spec list_admin_users() :: [User.t()]
  def list_admin_users() do
    from(u in User,
      join: ug in assoc(u, :groups),
      where: ug.is_admin_group == true,
      order_by: [u.name, u.email],
      distinct: true
    )
    |> Repo.all()
  end

  @doc """
  Gets a single user.

  Returns nil if the User does not exist.

  ## Examples

      iex> get_user(123)
      %User{}

      iex> get_user(456)
      nil

  """
  @spec get_user(User.id()) :: User.t() | nil
  def get_user(id) do
    Repo.get(User, id)
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
  @spec get_user_by_email(User.email()) :: User.t() | nil
  def get_user_by_email(email) do
    Repo.get_by(User, email: email)
  end

  @doc """
  Searches users by text. The user is searched by *exact match* of email, or by name or nickname

  ## Examples

      iex> search_user("vader")
      [%User{}]
  """
  @spec search_user(String.t()) :: [User.t()]
  def search_user(searchtext) do
    matching_searchtext = "%#{searchtext}%"

    query =
      from(u in User,
        where:
          u.email == ^searchtext or
            (ilike(u.name, ^matching_searchtext) or ilike(u.nickname, ^matching_searchtext))
      )

    Repo.all(query)
  end

  @doc """
  Updates a user by an admin.
  This is to assign groups.
  See `Lotta.Accounts.update_profile/2` if you want to change your own user's data.
  See `Lotta.Accounts.User.update_changeset/2` to see the changeset in use.

  ## Examples

      iex> update_user(user, %{field: new_value})
      {:ok, %User{}}

      iex> update_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

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

  ## Examples

      iex> update_profile(user, %{field: new_value})
      {:ok, %User{}}

      iex> update_profile(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  @spec update_profile(User.t(), map()) :: {:ok, User.t()} | {:error, Changeset.t()}
  def update_profile(%User{} = user, attrs) do
    user
    |> User.update_profile_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  List all available user groups

  ## Examples
    iex> list_user_groups()
    [%UserGroup{}, ...]
  """
  @spec list_user_groups() :: [UserGroup.t()]
  def list_user_groups() do
    Repo.all(UserGroup)
  end

  @doc """
  Get groups which have a given enrollment token

  ## Examples
    iex> list_groups_for_enrollment_token("token")
    [%UserGroup{}, ...]
  """
  @spec list_groups_for_enrollment_token(String.t()) :: [%GroupEnrollmentToken{}]
  def list_groups_for_enrollment_token(token) when is_binary(token) do
    from(g in UserGroup,
      join: t in GroupEnrollmentToken,
      on: g.id == t.group_id,
      where: t.token == ^token,
      distinct: true
    )
    |> Repo.all(prefix: Ecto.get_meta(token, :prefix))
  end

  @doc """
  Get groups which have given enrollment tokens.
  If no tenant is passed to the function, the current
  process' tenant will be taken.

  ## Examples
    iex> list_groups_for_enrollment_tokens(["token", "other-token"])
    [%UserGroup{}, ...]
  """
  @spec list_groups_for_enrollment_tokens([String.t()], Tenant.t() | nil) :: [
          %GroupEnrollmentToken{}
        ]
  def list_groups_for_enrollment_tokens(tokens, tenant \\ nil) when is_list(tokens) do
    prefix = if tenant, do: tenant.prefix, else: Repo.get_prefix()

    from(g in UserGroup,
      join: t in GroupEnrollmentToken,
      on: g.id == t.group_id,
      where: t.token in ^tokens,
      distinct: true
    )
    |> Repo.all(prefix: prefix)
  end

  @doc """
  Registers a user, generating a first-time password.
  If successfull, returns a user and a password.

  ## Examples

      iex> register_user(tenant, %{field: new_value})
      {:ok, %User{}, password}

      iex> register_user(tenant, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  @spec register_user(Tenant.t(), map()) :: {:ok, User.t(), String.t()} | {:error, Changeset.t()}
  def register_user(tenant, attrs) do
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

        {:ok, user, generated_pw}

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
  @spec delete_user(User.t()) :: {:ok, User.t()} | {:error, Changeset.t()}
  def delete_user(%User{} = user) do
    # delete every file manually so that the files are deleted
    # this should probably be merged to a genserver / bg job of some kind
    from(f in File, where: f.user_id == ^user.id)
    |> Repo.all()
    |> Enum.each(&Storage.delete_file/1)

    Repo.delete(user)
  end

  @doc """
  Request a password reset.
  If a user exists for the given email address,
  this creates a reset token with 6 hours validity and sends it to the user.
  If a user does not exist, {:error, :nouser} is returned.
  If a user exists, {:ok, User} is returned.
  Any error from redis is related.

  # Examples
  iex> request_password_reset("valid@email.com")
  {:ok, %User{}}
  iex> request_password_reset("invalid@email.com")
  {:error, :nouser}
  """
  @spec request_password_reset(User.email()) :: {:ok, User.t()} | {:error, term()}
  def request_password_reset(email) do
    token =
      :crypto.strong_rand_bytes(32)
      |> Base.url_encode64(padding: false)
      |> URI.encode()

    user =
      Repo.one(
        from(u in User,
          where: fragment("lower(?)", u.email) == ^String.downcase(email)
        )
      )

    if is_nil(user) do
      {:error, :nouser}
    else
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
          Logger.warn("User, token and reset token do not match for #{email}")
          {:error, :invalid_token}
        end

      error ->
        Logger.error(inspect(error))
        Sentry.capture_message(inspect(error), extra: %{email: email})
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

  ## Examples

      iex> get_user_group(123)
      %UserGroup{}

      iex> get_user_group(456)
      ** (Ecto.NoResultsError)

  """
  @spec get_user_group(pos_integer()) :: UserGroup.t() | nil
  def get_user_group(id) do
    Repo.get(UserGroup, id)
  end

  @doc """
  Creates a group.

  ## Examples

      iex> create_user_group(user_group)
      {:ok, %UserGroup{}}

      iex> create_user_group(user_group)
      {:error, %Ecto.Changeset{}}

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

    UserGroup.changeset(%UserGroup{}, attrs)
    |> Repo.insert(prefix: Repo.get_prefix())
  end

  @doc """
  Updates a group.

  ## Examples

      iex> update_user_group(user_group, %{field: new_value})
      {:ok, %User{}}

      iex> update_user_group(user_group, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  @spec update_user_group(UserGroup.t(), map()) :: {:ok, UserGroup.t()} | {:error, Changeset.t()}
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
  @spec delete_user_group(UserGroup.t()) :: {:ok, UserGroup.t()} | {:error, Changeset.t()}
  def delete_user_group(%UserGroup{} = group) do
    Repo.delete(group)
  end

  @doc """
  Sets the 'last seen' property on a user

  ## Examples

      iex> see_user(user)
      %User{}

  """
  @spec see_user(User.t()) :: {:ok, UserGroup.t()} | {:error, Changeset.t()}
  def see_user(%User{} = user) do
    user
    |> Ecto.Changeset.change(%{
      last_seen: DateTime.truncate(DateTime.utc_now(), :second)
    })
    |> Repo.update()
  end
end
