defmodule Lotta.Storage.FileDataTest do
  @moduledoc false

  use Lotta.DataCase

  import Mock

  alias Lotta.Storage
  alias Lotta.Storage.FileData

  describe "FileData" do
    test "from_stream/3 should create valid FileData" do
      stream = File.stream!("test/support/fixtures/ich_schoen.jpg")

      assert {:ok, file_data} =
               FileData.from_stream(stream, "ich_schoen.jpg", mime_type: "image/jpeg")

      assert Keyword.get(file_data.metadata, :mime_type) == "image/jpeg"
      assert Keyword.get(file_data.metadata, :size) == 0
    end

    test "from_path/2 should create valid FileData" do
      path = "test/support/fixtures/ich_schoen.jpg"

      assert {:ok, file_data} =
               FileData.from_path(path, mime_type: "image/jpeg")

      assert Keyword.get(file_data.metadata, :mime_type) == "image/jpeg"
      assert Keyword.get(file_data.metadata, :size) == File.stat!(path).size
    end

    test "copy_to_file/2 should copy a stream-based file_data" do
      stream = File.stream!("test/support/fixtures/ich_schoen.jpg")
      pathname = System.tmp_dir() <> "/ich_schoen#{:rand.uniform(1000)}.jpg"

      assert {:ok, file_data} =
               FileData.from_stream(stream, "ich_schoen.jpeg", mime_type: "image/jpeg")

      assert {:ok, copied} = FileData.copy_to_file(file_data, pathname)

      assert Keyword.get(copied.metadata, :mime_type) == "image/jpeg"

      assert Keyword.get(copied.metadata, :size) > 0
    end

    test "cache_file/2 should cache file to disk, get_cached should fetch it" do
      file =
        %Storage.File{id: 1}
        |> Ecto.put_meta(prefix: "tenant_test2")

      {:ok, file_data} =
        FileData.from_stream(
          File.stream!("test/support/fixtures/ich_schoen.jpg"),
          "ich_schoen.jpg"
        )

      assert {:ok,
              %FileData{
                _path: path
              }} =
               FileData.cache(file_data, for: file)

      assert "ich_schoen.jpg" = Keyword.get(file_data.metadata, :filename)
      assert "image/jpeg" = Keyword.get(file_data.metadata, :mime_type)

      assert File.exists?(path)
      assert String.starts_with?(path, System.tmp_dir())

      with_mock System, tmp_dir: fn -> nil end do
        assert {:error, "Failed to get cache path"} =
                 FileData.cache(file_data, for: file)
      end

      assert %FileData{_path: path, metadata: metadata} =
               FileData.get_cached(for: file)

      assert File.exists?(path)
      assert String.starts_with?(path, System.tmp_dir())
      assert String.ends_with?(path, "tenant_test2_1_original")
      assert "tenant_test2_1_original" = Keyword.get(metadata, :filename)

      assert is_nil(FileData.get_cached(for: Map.put(file, :id, "nichtda")))
    end
  end
end
