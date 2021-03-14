defmodule Api.Accounts do
  @moduledoc """
  The Accounts context.
  """

  require Logger

  import Ecto.Query

  alias Ecto.Changeset
  alias Api.Repo
  alias Api.Mailer

  alias Api.Accounts.{
    User,
    UserGroup,
    GroupEnrollmentToken,
    Directory,
    File,
    FileConversion
  }

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
  See `Api.Accounts.update_profile/2` if you want to change your own user's data.
  See `Api.Accounts.User.update_changeset/2` to see the changeset in use.

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
    |> Repo.update()
  end

  @doc """
  Update a user's profile.
  This is for profile data like image, name, ...
  See `Api.Accounts.User.update_profile_changeset/2` to see the changeset in use.

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
    |> Repo.all()
  end

  @doc """
  Get groups which have given enrollment tokens

  ## Examples
    iex> list_groups_for_enrollment_tokens(["token", "other-token"])
    [%UserGroup{}, ...]
  """
  @spec list_groups_for_enrollment_tokens([String.t()]) :: [%GroupEnrollmentToken{}]
  def list_groups_for_enrollment_tokens(tokens) when is_list(tokens) do
    from(g in UserGroup,
      join: t in GroupEnrollmentToken,
      on: g.id == t.group_id,
      where: t.token in ^tokens,
      distinct: true
    )
    |> Repo.all()
  end

  @doc """
  Registers a user, generating a first-time password.
  If successfull, returns a user and a password.

  ## Examples

      iex> register_user(%{field: new_value})
      {:ok, %User{}, password}

      iex> register_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  @spec register_user(map()) :: {:ok, User.t(), String.t()} | {:error, Changeset.t()}
  def register_user(attrs) do
    pw_length = 8

    generated_pw =
      :crypto.strong_rand_bytes(pw_length)
      |> Base.url_encode64()
      |> binary_part(0, pw_length)

    attrs =
      attrs
      |> Map.put(:password, generated_pw)

    changeset =
      %User{}
      |> User.registration_changeset(attrs)

    case Repo.insert(changeset) do
      {:ok, user} ->
        user
        |> create_new_user_directories()

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
    |> Enum.each(&delete_file/1)

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
      from(u in User,
        where: fragment("lower(?)", u.email) == ^String.downcase(email)
      )
      |> Repo.one()

    if is_nil(user) do
      {:error, :nouser}
    else
      case Redix.command(:redix, [
             "SET",
             "user-email-verify-token-#{user.email}",
             token,
             "EX",
             6 * 60 * 60
           ]) do
        {:ok, _} ->
          Api.Email.request_password_reset_mail(user, token)
          |> Mailer.deliver_now()

          {:ok, user}

        error ->
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
    case Redix.command(:redix, ["GET", "user-email-verify-token-#{email}"]) do
      {:ok, reset_token} when not is_nil(reset_token) ->
        user = Repo.get_by(User, email: email)

        if token == reset_token and not is_nil(user) do
          Redix.command(:redix, ["DEL", "user-email-verify-token-#{email}"])
          {:ok, user}
        else
          Logger.warn("User, token and reset token do not match for #{email}")
          {:error, :invalid_token}
        end

      error ->
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
        Api.Email.password_changed_mail(user)
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
  List root directories for a user
  """
  @spec list_root_directories(User.t()) :: [Directory.t()]
  def list_root_directories(%User{} = user) do
    from(d in Directory,
      where:
        is_nil(d.parent_directory_id) and
          (d.user_id == ^user.id or is_nil(d.user_id)),
      order_by: [fragment("? DESC NULLS LAST", d.user_id), :name]
    )
    |> Repo.all()
  end

  @doc """
  List a directory's subdirectories
  """
  @spec list_directories(Directory.t()) :: [Directory.t()]
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
      %Directory{}

      iex> get_directory(456)
      nil

  """
  @spec get_directory(pos_integer()) :: Directory.t() | nil
  def get_directory(id), do: Repo.get(Directory, id)

  @doc """
  Creates a Directory.

  ## Examples

      iex> create_directory(%{field: value})
      {:ok, %Directory{}}

      iex> create_directory(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  @spec create_directory(map()) :: {:ok, Directory.t()} | {:error, Changeset.t()}
  def create_directory(attrs) do
    %Directory{}
    |> Directory.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Create the default directories for a new user
  """
  @spec create_new_user_directories(User.t()) :: [term()]
  def create_new_user_directories(%User{} = user) do
    ["Mein Profil", "Meine Bilder", "Meine Dokumente", "Meine Videos", "Meine Tondokumente"]
    |> Enum.map(fn name ->
      create_directory(%{
        name: name,
        user_id: user.id
      })
    end)
  end

  @doc """
  Updates a directory.

  ## Examples

      iex> update_directory(directory, path)
      {:ok, %Directory{}}

  """
  @spec update_directory(Directory.t(), map()) :: {:ok, Directory.t()} | {:error, Changeset.t()}
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
  @spec delete_directory(Directory.t()) :: {:ok, Directory.t()} | {:error, Changeset.t()}
  def delete_directory(%Directory{} = directory) do
    Repo.delete(directory)
  end

  @doc """
  Returns the list of files for a given directory

  ## Examples

      iex> list_files()
      [%File{}, ...]

  """
  @spec list_files(Directory.t()) :: [Directory.t()]
  def list_files(%Directory{} = parent_directory) do
    from(f in File,
      where: f.parent_directory_id == ^parent_directory.id,
      order_by: [:filename]
    )
    |> Repo.all()
  end

  @doc """
  Gets a single file.
  Returns `nil` if file is not found.

  ## Examples

      iex> get_file(123)
      %File{}

      iex> get_file(456)
      ** (Ecto.NoResultsError)

  """
  def get_file(id), do: Repo.get(File, id)

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
  Deletes a File AND all its dependend conversions

  ## Examples

      iex> delete_file(file)
      {:ok, %File{}}

      iex> delete_file(file)
      {:error, %Ecto.Changeset{}}

  """
  def delete_file(%File{} = file) do
    file = Repo.preload(file, [:file_conversions])

    Enum.each(file.file_conversions, fn file_conversion ->
      delete_file_conversion(file_conversion)
    end)

    File.delete_attachment(file)
    Repo.delete(file)
  end

  @doc """
  Given a list of ids, transfers the corresponding files to a public archive.
  This is the new directory structure created:
  / archive / <current_year> / <user_id> / <filename>.ext
  """
  @doc since: "2.0.0"

  @spec transfer_files_by_ids([pos_integer()], User.t()) :: [File.t()]

  def transfer_files_by_ids(file_ids, %User{id: user_id}) do
    from(f in File,
      where: f.user_id == ^user_id and f.id in ^file_ids
    )
    |> Repo.all()
    |> Enum.map(fn file ->
      parent_directory =
        List.last(ensure_archive_directory("#{DateTime.utc_now().year}/#{user_id}"))

      file
      |> Changeset.change(%{user_id: nil, parent_directory_id: parent_directory.id})
      |> Repo.update!()
    end)
  end

  @spec ensure_archive_directory(String.t() | nil) :: [Directory.t()]

  defp ensure_archive_directory(path) do
    [
      "archiv"
      | if(is_nil(path), do: [], else: String.split(path, "/"))
    ]
    |> Enum.reduce([], fn dirname, dir_list ->
      parent_directory = List.last(dir_list)

      parent_directory_condition =
        case parent_directory do
          nil ->
            dynamic([d], is_nil(d.parent_directory_id))

          directory ->
            dynamic([d], d.parent_directory_id == ^directory.id)
        end

      condition = dynamic([d], d.name == ^dirname and ^parent_directory_condition)

      from(d in Directory, where: ^condition)
      |> Repo.one()
      |> case do
        nil ->
          {:ok, directory} =
            create_directory(%{
              name: dirname,
              parent_directory_id:
                if(is_nil(parent_directory), do: nil, else: parent_directory.id)
            })

          dir_list ++ [directory]

        directory ->
          dir_list ++ [directory]
      end
    end)
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
    File.delete_attachment(file_conversion)
    Repo.delete(file_conversion)
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
      last_seen: NaiveDateTime.truncate(NaiveDateTime.utc_now(), :second)
    })
    |> Repo.update()
  end
end
