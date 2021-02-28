defmodule Api.Accounts.FileManagment do
  @moduledoc """
  This module provides utilities for handling user files and directories.
  """
  alias Api.Accounts.{Directory,File,User}
  alias Api.Repo

  import Ecto.Query

  @doc """
  Returns the size of the total of all files the user uploaded to
  *private* folders.
  This is used in order to calculate how much of a possible quota
  the user has used.
  Files uploaded into public folders do not count.
  Returns a size in bytes.
  """

  @spec total_user_files_size(User.t()) :: pos_integer()

  def total_user_files_size(%User{} = user) do
    from(
      f in File,
      join: d in Directory, on: f.parent_directory_id == d.id,
      where: f.user_id == ^user.id and not is_nil(d.user_id)
    )
    |> Repo.aggregate(:sum, :filesize)
  end
  
end
