defmodule Lotta.Storage.FileDataTest do
  @moduledoc false

  use Lotta.DataCase, async: true

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
  end
end
