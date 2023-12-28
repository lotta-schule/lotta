defmodule Lotta.StorageTest do
  @moduledoc false

  use Lotta.DataCase, async: true

  import Ecto.Query

  alias ExAws.S3
  alias Lotta.Accounts.User
  alias Lotta.{Fixtures, Repo, Storage}
  alias Lotta.Storage.{Directory, File}

  @prefix "tenant_test"

  setup do
    user =
      Repo.one!(
        from(u in User,
          where: u.email == ^"eike.wiewiorra@lotta.schule"
        ),
        prefix: @prefix
      )

    user_file =
      Repo.one!(
        from(f in File, where: f.filename == ^"eoa3.mp3"),
        prefix: @prefix
      )

    user_directory =
      Repo.one!(
        from(d in Directory, where: d.name == ^"ehrenberg-on-air"),
        prefix: @prefix
      )

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

      res = ExAws.request!(S3.list_objects("lotta-dev-ugc", prefix: "tenant_test"))

      assert %{
               status_code: 200,
               body: %{contents: contents}
             } = res

      assert Enum.any?(contents, &(&1.key == "tenant_test/#{uploaded_file.id}"))
    end

    test "set_remote_storage/2 should reupload a file to new location", %{user_file: user_file} do
      user_file = Repo.preload(user_file, :remote_storage_entity)

      current_file_datetime =
        ExAws.S3.head_object("lotta-dev-ugc", user_file.remote_storage_entity.path)
        |> ExAws.request!()
        |> Map.fetch!(:headers)
        |> Enum.find_value(fn {key, val} ->
          if key == "Date", do: val
        end)
        |> Timex.parse!("{RFC1123}")

      # wait 2 seconds in order to enforce new DateTime
      :timer.sleep(2000)

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
        Repo.get!(File, file.id, prefix: @prefix)
      end
    end

    test "should call get_http_url", %{user_file: user_file} do
      assert Storage.get_http_url(user_file) =~
               ~r/http:\/\/(minio|localhost|127\.0\.0\.1):9000\/tenant_test\//
    end

    test "should call get_http_url with download path", %{user_file: user_file} do
      assert Storage.get_http_url(user_file, download: true) =~
               ~r/http:\/\/(minio|localhost|127\.0\.0\.1):9000\/tenant_test\/.*\?response-content-disposition=attachment/
    end
  end
end
