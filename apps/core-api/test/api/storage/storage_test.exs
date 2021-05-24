defmodule Api.StorageTest do
  @moduledoc false

  use Api.DataCase, async: true

  alias ExAws.S3
  alias Api.Accounts.User
  alias Api.Fixtures
  alias Api.Repo
  alias Api.Storage
  alias Api.Storage.{Directory, File}

  setup do
    user = Repo.get_by!(User, email: "eike.wiewiorra@lotta.schule")
    user_file = Repo.get_by!(File, filename: "eoa3.mp3")
    user_directory = Repo.get_by!(Directory, name: "ehrenberg-on-air")

    {:ok,
     %{
       user: user,
       user_directory: user_directory,
       user_file: user_file
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
        S3.list_objects("lotta-dev-ugc", prefix: "test")
        |> ExAws.request!()

      assert %{
               status_code: 200,
               body: %{contents: contents}
             } = res

      assert Enum.any?(contents, &(&1.key == "test/#{uploaded_file.id}"))
    end

    test "set_remote_storage/2 should reupload a file to new location", %{user_file: user_file} do
      user_file =
        user_file
        |> Repo.preload(:remote_storage_entity)

      current_file_datetime =
        ExAws.S3.head_object("lotta-dev-ugc", user_file.remote_storage_entity.path)
        |> ExAws.request!()
        |> Map.fetch!(:headers)
        |> Enum.find_value(fn {key, val} ->
          if key == "Date", do: val
        end)
        |> Timex.parse!("{RFC1123}")

      {:ok, user_file} =
        user_file
        |> Storage.set_remote_storage("minio")

      assert %File{} = user_file

      new_file_datetime =
        ExAws.S3.head_object("lotta-dev-ugc", user_file.remote_storage_entity.path)
        |> ExAws.request!()
        |> Map.fetch!(:headers)
        |> Enum.find_value(fn {key, val} ->
          if key == "Date", do: val
        end)
        |> Timex.parse!("{RFC1123}")

      assert DateTime.compare(new_file_datetime, current_file_datetime) == :gt
    end

    test "delete_file/1 should delete file in the database" do
      user = Fixtures.fixture(:registered_user)
      file = Fixtures.fixture(:file, user)

      Storage.delete_file(file)

      assert_raise Ecto.NoResultsError, fn ->
        Repo.get!(File, file.id)
      end
    end

    test "should call get_http_url", %{user_file: user_file} do
      assert Api.Storage.get_http_url(user_file) =~
               ~r/http:\/\/minio:9000\/lotta-dev-ugc\/test\//
    end
  end
end
