defmodule Lotta.RemoteStorageTest do
  @moduledoc false

  use Lotta.DataCase, async: false

  import Mock

  alias Lotta.Storage.{RemoteStorage, RemoteStorageEntity}

  describe "RemoteStorage" do
    test "config_for_store/1 should return the config for the given store" do
      assert {:ok,
              %{
                type: RemoteStorage.Strategy.S3,
                config: %{bucket: "lotta-dev-ugc", endpoint: endpoint},
                name: "minio"
              }} = RemoteStorage.config_for_store("minio")

      assert endpoint =~ ~r/http:\/\/(minio|localhost|127\.0\.0\.1):9000/
    end

    test "config_for_store/1 should return an error tuple if the given name does not exist" do
      assert RemoteStorage.config_for_store("ATOM") == {:error, :unknown_store}
    end

    test "default_store/0 should return the configured default store" do
      assert RemoteStorage.default_store() == "minio"
    end

    test "get_strategy/1 should return the strategy for a given config name" do
      assert RemoteStorage.get_strategy("minio") == {:ok, RemoteStorage.Strategy.S3}
    end

    test "get_strategy/1 should return an error tuplee if an invalid identifier is passed" do
      assert RemoteStorage.get_strategy("ATOM") == {:error, :unknown_store}
    end

    test "get_strategy/1 should return the strategy for the default store if no config name is given" do
      assert RemoteStorage.get_strategy() == {:ok, RemoteStorage.Strategy.S3}
    end

    test "create/1 should call corresponding strategy" do
      with_mock RemoteStorage.Strategy.S3,
        create: fn _, path, config ->
          {:ok,
           %RemoteStorageEntity{
             path: path,
             store_name: config[:name]
           }}
        end do
        RemoteStorage.create(%Plug.Upload{}, "/")

        assert called(
                 RemoteStorage.Strategy.S3.create(:_, :_, %{
                   type: RemoteStorage.Strategy.S3
                 })
               )
      end
    end

    test "delete/1 should call correct strategy for the identifier" do
      with_mock RemoteStorage.Strategy.S3,
        delete: fn entity, _ ->
          {:ok, entity}
        end do
        entity = %RemoteStorageEntity{store_name: "minio", path: "/some"}
        RemoteStorage.delete(entity)
        assert called(RemoteStorage.Strategy.S3.delete(:_, :_))
      end
    end

    test "delete/1 should return an error tuple if store does not exist" do
      assert {:error, :unknown_store} =
               RemoteStorage.delete(%RemoteStorageEntity{
                 store_name: "ATOM",
                 path: "/some"
               })
    end

    test "exists?/1 should call correct strategy for the identifier" do
      with_mock RemoteStorage.Strategy.S3,
        exists?: fn _, _ ->
          true
        end do
        entity = %RemoteStorageEntity{store_name: "minio", path: "/some"}
        RemoteStorage.exists?(entity)
        assert called(RemoteStorage.Strategy.S3.exists?(:_, :_))
      end
    end

    test "exists?/1 should return :unknown if it's from another store" do
      assert :unknown =
               RemoteStorage.exists?(%RemoteStorageEntity{
                 store_name: "ATOM",
                 path: "/some"
               })
    end

    test "get_http_url/1 should call correct strategy's get_http_url" do
      with_mock RemoteStorage.Strategy.S3,
        get_http_url: fn entity, _options, _config ->
          "http://" <> entity.path
        end do
        entity = %RemoteStorageEntity{store_name: "minio", path: "/some"}
        RemoteStorage.get_http_url(entity)
        assert called(RemoteStorage.Strategy.S3.get_http_url(:_, :_, :_))
      end
    end

    test "get_http_url/1 should return nil if the given store does not exist" do
      assert RemoteStorage.get_http_url(%RemoteStorageEntity{
               store_name: "ATOM",
               path: "/some"
             }) == nil
    end
  end
end
