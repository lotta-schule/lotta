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
  end
end
