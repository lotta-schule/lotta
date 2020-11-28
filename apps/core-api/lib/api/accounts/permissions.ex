defmodule Api.Accounts.Permissions do
  @moduledoc """
  This module provides methods helping finding if a user has certain permissions.
  """

  alias Api.Repo
  alias Api.Accounts.{Directory, File, User}
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
  Wether a given user has the permission to write files and directories to a given directory.

  Returns true or false
  """
  @doc since: "2.0.0"

  @spec user_can_write_directory?(User.t(), Directory.t()) :: boolean()

  def user_can_write_directory?(%User{} = user, %Directory{} = directory) do
    directory = Repo.preload(directory, [:user])

    user_is_author?(user, directory) ||
      if user_is_admin?(user) do
        # check if directory is public
        is_nil(directory.user)
      else
        false
      end
  end

  def user_can_write_directory?(_, _), do: false

  @doc """
  Wether a given user has the permission to read files and directories underneath a given directory.

  Returns true or false
  """
  @doc since: "2.0.0"

  @spec user_can_read_directory?(User.t(), Directory.t()) :: boolean()

  def user_can_read_directory?(%User{} = user, %Directory{} = directory) do
    directory = Repo.preload(directory, [:user])
    user_is_author?(user, directory) || is_nil(directory.user)
  end

  def user_can_read_directory?(_, _), do: false

  @doc """
  Wether a given user is member in a given set of groups

  Returns true or false
  """
  @doc since: "2.2.0"

  @spec user_is_in_groups_list?(User.t(), [pos_integer()]) :: boolean

  def user_is_in_groups_list?(_user, []), do: false

  def user_is_in_groups_list?(%User{} = user, [head | _] = group_ids) when is_number(head) do
    user_group_ids =
      User.get_groups(user)
      |> Enum.map(& &1.id)

    Enum.any?(group_ids, &Enum.member?(user_group_ids, &1))
  end

  @doc """
  Wether a given user has the permission to read files and directories underneath a given directory.

  Returns true or false
  """
  @doc since: "2.0.0"

  @spec user_has_group_for_article?(User.t(), Article.t()) :: boolean

  def user_has_group_for_article?(%User{} = user, %Article{} = article) do
    article_group_ids =
      article
      |> Repo.preload([:groups])
      |> Map.fetch!(:groups)
      |> Enum.map(& &1.id)

    Enum.empty?(article_group_ids) || user_is_in_groups_list?(user, article_group_ids)
  end
end
