defmodule Lotta.StorageTest do
  @moduledoc false

  use Lotta.WorkerCase

  alias Lotta.Accounts.User
  alias Lotta.{Fixtures, Repo, Storage, Tenants}
  alias Lotta.Storage.{Directory, File, FileData, RemoteStorage, RemoteStorageEntity}

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)

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
      {:ok, file_data} =
        FileData.from_path("test/support/fixtures/image_file.png", mime_type: "image/png")

      {:ok, uploaded_file} =
        Storage.create_file(
          file_data,
          directory,
          user
        )

      assert uploaded_file =
               %File{
                 remote_storage_entity: _remote_storage_entity,
                 file_conversions: _file_conversions
               } = Repo.preload(uploaded_file, [:file_conversions, :remote_storage_entity])

      res =
        ExAws.S3.get_object("lotta-dev-ugc", uploaded_file.remote_storage_entity.path)
        |> ExAws.request!()

      assert %{
               status_code: 200
             } = res

      %{file_conversions: file_conversions} =
        uploaded_file
        |> Repo.reload()
        |> Repo.preload(:file_conversions)

      assert uploaded_file.remote_storage_entity.path ==
               "tenant_test/#{uploaded_file.id}/original"

      assert Enum.count(file_conversions) > 0
    end

    test "copy_to_remote_storage/2 should reupload a file to new location", %{
      user_file: user_file
    } do
      Tesla.Mock.mock(fn
        %{method: :get} ->
          %Tesla.Env{status: 200, body: Elixir.File.stream!("test/support/fixtures/eoa3.mp3")}
      end)

      user_file = Repo.preload(user_file, :remote_storage_entity)

      current_file_datetime =
        ExAws.S3.head_object("lotta-dev-ugc", user_file.remote_storage_entity.path)
        |> ExAws.request!()
        |> Map.fetch!(:headers)
        |> Enum.find_value(fn {key, val} ->
          if key == "date", do: val
        end)
        |> Timex.parse!("{RFC1123}")

      # wait 1 seconds in order to enforce new DateTime
      :timer.sleep(1000)

      {:ok, user_file} =
        user_file
        |> Storage.copy_to_remote_storage("minio")

      assert %File{} = user_file

      new_file_datetime =
        ExAws.S3.head_object("lotta-dev-ugc", user_file.remote_storage_entity.path)
        |> ExAws.request!()
        |> Map.fetch!(:headers)
        |> Enum.find_value(fn {key, val} ->
          if key == "date", do: val
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

    test "delete_file/1 should remove the corresponding tenant's logo_image_file_id, if set" do
      tenant = Tenants.get_tenant_by_prefix(@prefix)

      user = Fixtures.fixture(:registered_user)
      file = Fixtures.fixture(:file, user)

      tenant =
        tenant
        |> Ecto.Changeset.change()
        |> Ecto.Changeset.put_change(:logo_image_file_id, file.id)
        |> Repo.update!(prefix: "public")
        |> Repo.reload!()

      assert tenant.logo_image_file_id == file.id

      Storage.delete_file(file)

      tenant = Repo.reload!(tenant)

      assert tenant.logo_image_file_id == nil
    end

    test "should list an unused RemoteStorageEntity in list_unused_remote_storage_entities/0" do
      tmp_path = Path.join(System.tmp_dir!(), "test.txt")
      Elixir.File.write!(tmp_path, "test")

      {:ok, file_data} = FileData.from_path(tmp_path, mime_type: "text/plain")

      %RemoteStorageEntity{id: id} =
        RemoteStorage.create(
          file_data,
          "unused/minio"
        )
        |> elem(1)
        |> Repo.insert!(prefix: @prefix)

      assert [%RemoteStorageEntity{id: ^id}] =
               Storage.list_unused_remote_storage_entities(@prefix)
    end

    test "should call get_http_url", %{user_file: user_file} do
      assert Storage.get_http_url(user_file) =~
               ~r/http:\/\/(minio|localhost|127\.0\.0\.1):9000\/lotta-dev-ugc\/tenant_test\//
    end

    test "should call get_http_url with download path, but do nothing of it", %{
      user_file: user_file
    } do
      assert Storage.get_http_url(user_file) =~
               ~r/http:\/\/(minio|localhost|127\.0\.0\.1):9000\/lotta-dev-ugc\/tenant_test\/.*/
    end

    test "should call get_path with directory", %{
      user_directory: dir,
      user: user
    } do
      assert Storage.get_path(dir, user) == []
    end

    test "should call get_path with file", %{
      user_file: file,
      user: user
    } do
      assert path = Storage.get_path(file, user)
      assert Enum.map(path, & &1.name) == ["ehrenberg-on-air"]
    end
  end
end
