defmodule Api.AccountTest do
  use Api.DataCase

  alias Api.Account

  describe "files" do
    alias Api.Accounts.File

    @valid_attrs %{file_type: "some file_type", filename: "some filename", filesize: 42, mime_type: "some mime_type", path: "some path", remote_location: "some remote_location"}
    @update_attrs %{file_type: "some updated file_type", filename: "some updated filename", filesize: 43, mime_type: "some updated mime_type", path: "some updated path", remote_location: "some updated remote_location"}
    @invalid_attrs %{file_type: nil, filename: nil, filesize: nil, mime_type: nil, path: nil, remote_location: nil}

    def file_fixture(attrs \\ %{}) do
      {:ok, file} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Accounts.create_file()

      file
    end

    test "list_files/0 returns all files" do
      file = file_fixture()
      assert Accounts.list_files() == [file]
    end

    test "get_file!/1 returns the file with given id" do
      file = file_fixture()
      assert Accounts.get_file!(file.id) == file
    end

    test "create_file/1 with valid data creates a file" do
      assert {:ok, %File{} = file} = Accounts.create_file(@valid_attrs)
      assert file.file_type == "some file_type"
      assert file.filename == "some filename"
      assert file.filesize == 42
      assert file.mime_type == "some mime_type"
      assert file.path == "some path"
      assert file.remote_location == "some remote_location"
    end

    test "create_file/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_file(@invalid_attrs)
    end

    test "update_file/2 with valid data updates the file" do
      file = file_fixture()
      assert {:ok, %File{} = file} = Accounts.update_file(file, @update_attrs)
      assert file.file_type == "some updated file_type"
      assert file.filename == "some updated filename"
      assert file.filesize == 43
      assert file.mime_type == "some updated mime_type"
      assert file.path == "some updated path"
      assert file.remote_location == "some updated remote_location"
    end

    test "update_file/2 with invalid data returns error changeset" do
      file = file_fixture()
      assert {:error, %Ecto.Changeset{}} = Accounts.update_file(file, @invalid_attrs)
      assert file == Accounts.get_file!(file.id)
    end

    test "delete_file/1 deletes the file" do
      file = file_fixture()
      assert {:ok, %File{}} = Accounts.delete_file(file)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_file!(file.id) end
    end

    test "change_file/1 returns a file changeset" do
      file = file_fixture()
      assert %Ecto.Changeset{} = Accounts.change_file(file)
    end
  end
end
