defmodule Lotta.Storage.FileProcessorTest do
  @moduledoc false

  use Lotta.DataCase, async: true

  import Mock

  alias Lotta.Storage.{File, FileData, FileProcessor}
  alias Lotta.Storage.FileProcessor.ImageProcessor

  describe "FileProcessor" do
    test "from_stream/3 should create valid FileData" do
      get_file_data =
        &elem(
          FileData.from_stream(
            Elixir.File.stream!("test/support/fixtures/#{&1}"),
            &1
          ),
          1
        )

      with_mock ImageProcessor,
        read_metadata: fn _ -> {:ok, %{a: "b"}} end do
        assert {:ok, %{a: "b"}} =
                 FileProcessor.read_metadata(get_file_data.("ich_schoen.jpg"))

        assert {:error, "Unsupported file type"} =
                 FileProcessor.read_metadata(get_file_data.("secrets.zip"))
      end
    end

    test "convert_immediate_formats/1 should convert file to all immediate formats" do
      with_mock ImageProcessor,
        process: fn _, _ ->
          {:ok,
           [
             preview_200: %FileData{},
             preview_400: %FileData{},
             preview_800: %FileData{}
           ]}
        end do
        {:ok, file_data} = FileData.from_path("test/support/fixtures/ich_schoen.jpg")

        assert [preview_200: %FileData{}, preview_400: %FileData{}, preview_800: %FileData{}] =
                 FileProcessor.convert_immediate_formats(file_data)

        {:ok, file_data} = FileData.from_path("test/support/fixtures/secrets.zip")

        assert [] =
                 FileProcessor.convert_immediate_formats(file_data)
      end
    end

    test "process_file/2 should process file with given format category" do
      {:ok, file_data} = FileData.from_path("test/support/fixtures/ich_schoen.jpg")

      with_mock ImageProcessor,
        process: fn _, _ ->
          {:ok,
           [
             preview_200: %FileData{},
             preview_400: %FileData{},
             preview_800: %FileData{}
           ]}
        end do
        assert {:ok,
                [preview_200: %FileData{}, preview_400: %FileData{}, preview_800: %FileData{}]} =
                 FileProcessor.process_file(
                   file_data,
                   :preview
                 )

        assert {:error, "Invalid format category gibtsnicht"} =
                 FileProcessor.process_file(
                   file_data,
                   :gibtsnicht
                 )
      end
    end

    test "cache_file/2 should cache file to disk, get_cached should fetch it" do
      file =
        %File{id: 1}
        |> Ecto.put_meta(prefix: "tenant_test2")

      {:ok, file_data} =
        FileData.from_stream(
          Elixir.File.stream!("test/support/fixtures/ich_schoen.jpg"),
          "ich_schoen.jpg"
        )

      assert {:ok,
              %FileData{
                _path: path
              }} =
               FileProcessor.cache_file(
                 file,
                 file_data
               )

      assert "ich_schoen.jpg" = Keyword.get(file_data.metadata, :filename)
      assert "image/jpeg" = Keyword.get(file_data.metadata, :mime_type)

      assert Elixir.File.exists?(path)
      assert String.starts_with?(path, System.tmp_dir())

      with_mock System, tmp_dir: fn -> nil end do
        assert {:error, "Failed to get cache path"} =
                 FileProcessor.cache_file(file, file_data)
      end

      assert {:ok, %FileData{_path: path, metadata: metadata}} =
               FileProcessor.get_cached(file)

      assert Elixir.File.exists?(path)
      assert String.starts_with?(path, System.tmp_dir())
      assert String.ends_with?(path, "tenant_test2_1_original")
      assert "tenant_test2_1_original" = Keyword.get(metadata, :filename)

      assert {:error, :enoent} =
               FileProcessor.get_cached(Map.put(file, :id, "nichtda"))
    end
  end
end
