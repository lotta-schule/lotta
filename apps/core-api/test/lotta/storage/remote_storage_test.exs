defmodule Lotta.RemoteStorageTest do
  @moduledoc false

  use Lotta.DataCase, async: true

  import Mox

  alias Lotta.Storage.{FileData, RemoteStorage, RemoteStorageEntity}

  setup :verify_on_exit!

  describe "RemoteStorage config" do
    test "config_for_store/1 should return the config for the given store" do
      assert {:ok,
              %{
                type: Lotta.Storage.RemoteStorage.Strategy.S3,
                config: %{bucket: bucket, endpoint: endpoint},
                name: "minio"
              }} = RemoteStorage.config_for_store("minio")

      assert bucket =~ ~r/^lotta-/
      assert endpoint =~ ~r/http:\/\/(minio|localhost|127\.0\.0\.1)/
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
  end

  describe "RemoteStorage strategy delegation" do
    setup do
      original_config = Application.get_env(:lotta, Lotta.Storage.RemoteStorage)
      on_exit(fn -> Application.put_env(:lotta, Lotta.Storage.RemoteStorage, original_config) end)

      new_storages =
        Map.new(original_config[:storages], fn {name, cfg} ->
          {name, Map.put(cfg, :type, Lotta.Storage.RemoteStorage.StrategyMock)}
        end)

      Application.put_env(
        :lotta,
        Lotta.Storage.RemoteStorage,
        Keyword.put(original_config, :storages, new_storages)
      )

      :ok
    end

    test "create/1 should call corresponding strategy" do
      expect(Lotta.Storage.RemoteStorage.StrategyMock, :create, fn _file, path, config, _meta ->
        {:ok, %RemoteStorageEntity{path: path, store_name: config[:name]}}
      end)

      assert {:ok, _} = RemoteStorage.create(%FileData{}, "/")
    end

    test "delete/1 should call correct strategy for the identifier" do
      entity = %RemoteStorageEntity{store_name: "minio", path: "/some"}
      expect(Lotta.Storage.RemoteStorage.StrategyMock, :delete, fn _path, _config -> :ok end)
      assert {:ok, ^entity} = RemoteStorage.delete(entity)
    end

    test "delete/1 should return an error tuple if store does not exist" do
      assert {:error, :unknown_store} =
               RemoteStorage.delete(%RemoteStorageEntity{
                 store_name: "ATOM",
                 path: "/some"
               })
    end

    test "exists?/1 should call correct strategy for the identifier" do
      entity = %RemoteStorageEntity{store_name: "minio", path: "/some"}
      expect(Lotta.Storage.RemoteStorage.StrategyMock, :exists?, fn _entity, _config -> true end)
      assert RemoteStorage.exists?(entity)
    end

    test "exists?/1 should return :unknown if it's from another store" do
      assert :unknown =
               RemoteStorage.exists?(%RemoteStorageEntity{
                 store_name: "ATOM",
                 path: "/some"
               })
    end

    test "get_http_url/1 should call correct strategy's get_http_url" do
      entity = %RemoteStorageEntity{store_name: "minio", path: "/some"}

      expect(Lotta.Storage.RemoteStorage.StrategyMock, :get_http_url, fn e, _config, _opts ->
        "http://" <> e.path
      end)

      assert "http:///some" = RemoteStorage.get_http_url(entity)
    end

    test "get_http_url/1 should return nil if the given store does not exist" do
      assert RemoteStorage.get_http_url(%RemoteStorageEntity{
               store_name: "ATOM",
               path: "/some"
             }) == nil
    end
  end
end
