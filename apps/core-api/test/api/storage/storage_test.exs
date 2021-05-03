defmodule Api.StorageTest do
  @moduledoc false

  use Api.DataCase, async: true

  alias ExAws.S3
  alias Api.Accounts.User
  alias Api.Fixtures
  alias Api.Repo
  alias Api.Repo.Seeder
  alias Api.Storage
  alias Api.Storage.{Directory, File}

  setup do
    Seeder.seed()
    user = Repo.get_by!(User, email: "eike.wiewiorra@lotta.schule")
    user_directory = Repo.get_by!(Directory, name: "ehrenberg-on-air")

    {:ok,
     %{
       user: user,
       user_directory: user_directory
     }}
  end

  describe "Storage" do
    test "should upload a file from an upload object", %{
      user_directory: directory,
      user: user
    } do
      upload_obj = %Plug.Upload{
        filename: "image_file.png",
        content_type: "image/png",
        path: "test/support/fixtures/image_file.png"
      }

      res =
        Storage.create_stored_file_from_upload(
          upload_obj,
          directory,
          user
        )

      assert {:ok, uploaded_file} = res

      assert %File{
               remote_storage_entity: _remote_storage_entity
             } = uploaded_file

      res =
        S3.list_objects("lotta-dev-ugc", prefix: "tenant_2")
        |> ExAws.request!()

      assert %{
               status_code: 200,
               body: %{contents: contents}
             } = res

      assert Enum.any?(contents, &(&1.key == "tenant_2/#{uploaded_file.id}"))
    end

    test "delete_file/1 should delete file in the database" do
      user = Fixtures.fixture(:registered_user)
      file = Fixtures.fixture(:file, user)

      Storage.delete_file(file)

      assert_raise Ecto.NoResultsError, fn ->
        Repo.get!(File, file.id)
      end
    end
  end
end
