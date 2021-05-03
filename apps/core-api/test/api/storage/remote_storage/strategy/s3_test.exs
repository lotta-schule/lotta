defmodule Api.Storage.RemoteStorage.Strategy.S3Test do
  @moduledoc false

  import Mock

  alias Api.Repo

  use Api.DataCase, async: false

  describe "S3 RemoteStorage Strategy" do
    test "create a new file" do
      with_mock(ExAws,
        request: fn _request ->
          {:ok, :ok}
        end
      ) do
        entity =
          Api.Storage.RemoteStorage.Strategy.S3.create(
            %Plug.Upload{
              filename: "image_file.png",
              content_type: "image/png",
              path: "test/support/fixtures/image_file.png"
            },
            "new",
            %{name: "minio"}
          )

        assert {
                 :ok,
                 %Api.Storage.RemoteStorageEntity{
                   path: "tenant_2/new",
                   store_name: "minio"
                 }
               } = entity
      end
    end

    test "delete a file" do
      with_mock(ExAws,
        request: fn _request ->
          {:ok, :ok}
        end
      ) do
        Api.Storage.RemoteStorage.Strategy.S3.delete(
          %Api.Storage.RemoteStorageEntity{
            path: "tenant_2/new",
            store_name: "minio"
          },
          %{name: "minio", config: %{bucket: "lotta-dev-ugc"}}
        )
      end
    end

    test "should return the a correct public path" do
      entity = %Api.Storage.RemoteStorageEntity{
        path: "tenant_2/abcdef",
        store_name: ""
      }

      assert Api.Storage.RemoteStorage.Strategy.S3.get_http_url(entity, %{
               config: %{endpoint: "http://minio:9000", bucket: "lotta-dev-ugc"}
             }) ==
               "http://minio:9000/lotta-dev-ugc/tenant_2/abcdef"
    end
  end
end
