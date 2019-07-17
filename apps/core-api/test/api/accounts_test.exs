defmodule Api.AccountsTest do
  use Api.DataCase

  alias Api.Accounts

  describe "users" do
    alias Api.Accounts.User

    @valid_attrs %{email: "some email", name: "some name"}
    @update_attrs %{email: "some updated email", name: "some updated name"}
    @invalid_attrs %{email: nil, name: nil}

    def user_fixture(attrs \\ %{}) do
      {:ok, user} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Accounts.create_user()

      user
    end

    test "list_users/0 returns all users" do
      user = user_fixture()
      assert Accounts.list_users() == [user]
    end

    test "get_user!/1 returns the user with given id" do
      user = user_fixture()
      assert Accounts.get_user!(user.id) == user
    end

    test "create_user/1 with valid data creates a user" do
      assert {:ok, %User{} = user} = Accounts.create_user(@valid_attrs)
      assert user.email == "some email"
      assert user.name == "some name"
    end

    test "create_user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_user(@invalid_attrs)
    end

    test "update_user/2 with valid data updates the user" do
      user = user_fixture()
      assert {:ok, %User{} = user} = Accounts.update_user(user, @update_attrs)
      assert user.email == "some updated email"
      assert user.name == "some updated name"
    end

    test "update_user/2 with invalid data returns error changeset" do
      user = user_fixture()
      assert {:error, %Ecto.Changeset{}} = Accounts.update_user(user, @invalid_attrs)
      assert user == Accounts.get_user!(user.id)
    end

    test "delete_user/1 deletes the user" do
      user = user_fixture()
      assert {:ok, %User{}} = Accounts.delete_user(user)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_user!(user.id) end
    end

    test "change_user/1 returns a user changeset" do
      user = user_fixture()
      assert %Ecto.Changeset{} = Accounts.change_user(user)
    end
  end

  describe "file_conversions" do
    alias Api.Accounts.FileConversion

    @valid_attrs %{file_type: "some file_type", format: "some format", mime_type: "some mime_type", remote_location: "some remote_location"}
    @update_attrs %{file_type: "some updated file_type", format: "some updated format", mime_type: "some updated mime_type", remote_location: "some updated remote_location"}
    @invalid_attrs %{file_type: nil, format: nil, mime_type: nil, remote_location: nil}

    def file_conversion_fixture(attrs \\ %{}) do
      {:ok, file_conversion} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Accounts.create_file_conversion()

      file_conversion
    end

    test "list_file_conversions/0 returns all file_conversions" do
      file_conversion = file_conversion_fixture()
      assert Accounts.list_file_conversions() == [file_conversion]
    end

    test "get_file_conversion!/1 returns the file_conversion with given id" do
      file_conversion = file_conversion_fixture()
      assert Accounts.get_file_conversion!(file_conversion.id) == file_conversion
    end

    test "create_file_conversion/1 with valid data creates a file_conversion" do
      assert {:ok, %FileConversion{} = file_conversion} = Accounts.create_file_conversion(@valid_attrs)
      assert file_conversion.file_type == "some file_type"
      assert file_conversion.format == "some format"
      assert file_conversion.mime_type == "some mime_type"
      assert file_conversion.remote_location == "some remote_location"
    end

    test "create_file_conversion/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_file_conversion(@invalid_attrs)
    end

    test "update_file_conversion/2 with valid data updates the file_conversion" do
      file_conversion = file_conversion_fixture()
      assert {:ok, %FileConversion{} = file_conversion} = Accounts.update_file_conversion(file_conversion, @update_attrs)
      assert file_conversion.file_type == "some updated file_type"
      assert file_conversion.format == "some updated format"
      assert file_conversion.mime_type == "some updated mime_type"
      assert file_conversion.remote_location == "some updated remote_location"
    end

    test "update_file_conversion/2 with invalid data returns error changeset" do
      file_conversion = file_conversion_fixture()
      assert {:error, %Ecto.Changeset{}} = Accounts.update_file_conversion(file_conversion, @invalid_attrs)
      assert file_conversion == Accounts.get_file_conversion!(file_conversion.id)
    end

    test "delete_file_conversion/1 deletes the file_conversion" do
      file_conversion = file_conversion_fixture()
      assert {:ok, %FileConversion{}} = Accounts.delete_file_conversion(file_conversion)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_file_conversion!(file_conversion.id) end
    end

    test "change_file_conversion/1 returns a file_conversion changeset" do
      file_conversion = file_conversion_fixture()
      assert %Ecto.Changeset{} = Accounts.change_file_conversion(file_conversion)
    end
  end
end
