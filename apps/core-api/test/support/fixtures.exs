defmodule Api.Fixtures do
  alias Api.Repo
  alias Api.Accounts.{User}

  def fixture(:valid_user_attrs) do
    %{
      email: "some email",
      name: "Alberta Smith",
      nickname: "TheNick"
      class: "5"
      password: "password"
    }
  end
  
  def fixture(:invalid_user_attrs) do
    %{
      email: nil,
      name: nil,
      nickname: nil
    }
  end

  def fixture(:registered_user) do
    {:ok, user} = Accounts.register(%{
      email: "some email",
      name: "Alberta Smith",
      nickname: "TheNick"
      class: "5"
      password: "password"
    })
    user
  end

  def fixture(:valid_file_attrs) do
    %{
      file_type: "some_file_type",
      filename: "some_filename",
      filesize: 42,
      mime_type: "some_mime_type",
      path: "some_path",
      remote_location: "some_remote_location"
    }
  end
  
  def fixture(:invalid_file_attrs) do
    %{
      file_type: nil,
      filename: nil,
      filesize: 0
    }
  end

  def fixture(:file) do
    {:ok, file} = Accounts.create_file(fixture(:valid_file_attrs))
    file
  end
end