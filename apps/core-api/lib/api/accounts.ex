defmodule Api.Accounts do
  @moduledoc """
  The Accounts context.
  """

  import Ecto.Query, warn: false
  alias Api.Repo

  alias Api.Accounts.{User,File}

  def data() do
    Dataloader.Ecto.new(Api.Repo, query: &query/2)
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
  def list_users do
    Repo.all(User)
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
  def get_user!(id), do: Repo.get!(User, id)

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
  Registers a user.

  ## Examples

      iex> register_user(%{field: new_value})
      {:ok, %User{}}

      iex> register_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def register_user(attrs) do
    %User{}
    |> User.registration_changeset(attrs)
    |> Repo.insert()
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

  @doc """
  Returns the list of files.

  ## Examples

      iex> list_files()
      [%File{}, ...]

  """
  def list_files(tenant_id, user_id) do
    Repo.all(Ecto.Query.from f in File, where: f.tenant_id == ^tenant_id and f.user_id == ^user_id)
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
  def create_file(attrs \\ %{}) do
    %File{}
    |> File.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a file.

  ## Examples

      iex> update_file(file, %{field: new_value})
      {:ok, %File{}}

      iex> update_file(file, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

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

  alias Api.Accounts.FileConversion

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
end
