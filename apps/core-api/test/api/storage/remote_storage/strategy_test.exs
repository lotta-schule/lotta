defmodule Api.Storage.RemoteStorage.StrategyTest do
  @moduledoc false

  import Mock

  use ExUnit.Case, async: true

  describe "strategy" do
    test "should call default strategy create when Strategy" do
      with_mock Api.Storage.RemoteStorage.Strategy.S3,
        create: fn _, path, config ->
          {:ok,
           %Api.Storage.RemoteStorageEntity{
             path: path,
             store_name: config[:name]
           }}
        end do
        Api.Storage.RemoteStorage.create(%Plug.Upload{}, "/")

        assert called(
                 Api.Storage.RemoteStorage.Strategy.S3.create(:_, :_, %{
                   type: Api.Storage.RemoteStorage.Strategy.S3
                 })
               )
      end
    end

    test "should call correct strategy delete" do
      with_mock Api.Storage.RemoteStorage.Strategy.S3,
        delete: fn _, _ ->
          nil
        end do
        entity = %Api.Storage.RemoteStorageEntity{store_name: "minio", path: "/some"}
        Api.Storage.RemoteStorage.delete(entity)
        assert called(Api.Storage.RemoteStorage.Strategy.S3.delete(:_, :_))
      end
    end

    test "should call correct strategy get_http_url" do
      with_mock Api.Storage.RemoteStorage.Strategy.S3,
        get_http_url: fn _, _ ->
          nil
        end do
        entity = %Api.Storage.RemoteStorageEntity{store_name: "minio", path: "/some"}
        Api.Storage.RemoteStorage.get_http_url(entity)
        assert called(Api.Storage.RemoteStorage.Strategy.S3.get_http_url(:_, :_))
      end
    end
  end
end
