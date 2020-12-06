defmodule Api.Accounts.Permissions do
  @moduledoc """
  This module provides methods helping finding if a user has certain permissions.
  """

  alias Api.Repo
  alias Api.Accounts.{Directory, File, User, UserGroup}
  alias Api.Content.Article

  @doc """
  Wether a user has rights to administer the current and all other systems

  Returns true or false
  """
  @doc since: "2.0.0"

  @spec user_is_lotta_admin?(User.t()) :: boolean()

  def user_is_lotta_admin?(%User{} = user) do
    [
      "alexis.rinaldoni@einsa.net",
      "eike.wiewiorra@einsa.net",
      "billy@einsa.net"
    ]
    |> Enum.any?(fn email ->
      user.email == email
    end)
  end

  @doc """
  Wether a user has rights to control the system

  Returns true or false
  """
  @doc since: "2.0.0"

  @spec user_is_admin?(User.t()) :: boolean

  def user_is_admin?(%User{} = user) do
    user
    |> User.get_groups()
    |> Enum.any?(& &1.is_admin_group)
  end

  def user_is_admin?(_), do: false

  @doc """
  Wether a given user is an author or the author of a given article, directory or file

  Returns true or false
  """
  @doc since: "2.0.0"

  @spec user_is_author?(User.t(), Article.t() | Directory.t() | File.t()) :: boolean

  def user_is_author?(%User{} = user, %Article{} = article) do
    article
    |> Repo.preload(:users)
    |> Map.get(:users)
    |> Enum.any?(fn u -> u.id == user.id end)
  end

  def user_is_author?(%User{id: user_id}, %Directory{} = directory) do
    case Repo.preload(directory, :user) do
      %{user: %{id: id}} -> id == user_id
      _ -> false
    end
  end

  def user_is_author?(%User{id: user_id}, %File{} = file) do
    case Repo.preload(file, :user) do
      %{user: %{id: id}} -> id == user_id
      _ -> false
    end
  end

  def user_is_author?(_, _), do: false

  @doc """
  Wether a given user has read-access to a given object.
  """
  @doc since: "2.2.0"
  @spec can_read?(User.t(), Article.t() | Directory.t()) :: boolean()
  def can_read?(user, object)

  def can_read?(user, %Article{} = article) do
    can_write?(user, article) ||
      (fn ->
         groups =
           article
           |> Repo.preload(:groups)
           |> Map.get(:groups, [])

         Enum.empty?(groups) || user_is_in_groups_list?(user, groups)
       end).()
  end

  def can_read?(user, %Directory{} = directory) do
    directory =
      directory
      |> Repo.preload([:user])

    user_is_author?(user, directory) || is_nil(directory.user)
  end

  def can_read?(user, %File{} = file) do
    file =
      file
      |> Repo.preload([:user, :parent_directory])

    user_is_author?(user, file) || can_read?(user, file.parent_directory)
  end

  @doc """
  Wether a given user has write-access to a given object.
  """
  @doc since: "2.2.0"
  @spec can_write?(User.t(), Article.t() | Directory.t()) :: boolean()
  def can_write?(user, object)

  def can_write?(user, %Article{} = article) do
    user_is_admin?(user) || user_is_author?(user, article)
  end

  def can_write?(user, %Directory{} = directory) do
    directory =
      directory
      |> Repo.preload([:user])

    user_is_author?(user, directory) ||
      if user_is_admin?(user) do
        # check if directory is public
        is_nil(directory.user)
      else
        false
      end
  end

  def can_write?(user, %File{} = file) do
    file =
      file
      |> Repo.preload([:user, :parent_directory])

    user_is_author?(user, file) || can_write?(user, file.parent_directory)
  end

  def can_write?(_, _), do: false

  @doc """
  Wether a given user is member in a given set of groups

  Returns true or false
  """
  @doc since: "2.2.0"

  @spec user_is_in_groups_list?(User.t() | nil, [UserGroup.t() | pos_integer()]) :: boolean

  def user_is_in_groups_list?(%User{} = user, groups) when length(groups) > 0 do
    user_group_ids =
      user
      |> User.get_groups()
      |> Enum.map(& &1.id)

    groups
    |> Enum.map(fn
      %UserGroup{id: id} ->
        id

      assume_id when is_bitstring(assume_id) ->
        String.to_integer(assume_id)

      assume_id ->
        assume_id
    end)
    |> Enum.any?(&Enum.member?(user_group_ids, &1))
  end

  def user_is_in_groups_list?(_, _), do: false
end
