defmodule Lotta.Storage.FileProcessor.ImageProcessorTest do
  use Lotta.DataCase
  import Mock

  alias Lotta.{Fixtures, Repo, Tenants}
  alias Lotta.Storage.FileData
  alias Lotta.Storage.Conversion.AvailableFormats
  alias Lotta.Storage.FileProcessor.ImageProcessor

  @prefix "tenant_test"

  describe "read_metadata/1" do
    setup do
      tenant = Tenants.get_tenant_by_prefix(@prefix)

      {:ok,
       %{
         tenant: tenant
       }}
    end

    test "returns metadata map on successful processing" do
      # Mocks for dependencies
      with_mock(Image,
        open: fn _stream -> {:ok, %{}} end,
        shape: fn _image -> {1920, 1080, 3} end,
        pages: fn _image -> 1 end,
        exif: fn _image -> {:ok, %{"make" => "camera_test"}} end,
        dominant_color: fn _image -> {:ok, [255, 12, 123]} end
      ) do
        # Assertion
        {:ok, file_data} = FileData.from_path("test/support/fixtures/image_file.png")

        assert {:ok,
                %{
                  channels: 3,
                  dominant_color: "#FF0C7B",
                  exif: %{"make" => "camera_test"},
                  height: 1080,
                  pages: 1,
                  width: 1920
                }} == ImageProcessor.read_metadata(file_data)
      end
    end

    test "returns an error when image processing fails" do
      # Mocks for dependencies
      {:ok, file_data} = FileData.from_path("test/support/fixtures/image_file.png")

      # Mocking the call chain
      with_mock(
        Image,
        open: fn _stream -> {:error, "failed to open"} end
      ) do
        # Assertion
        assert {:error, "failed to open"} == ImageProcessor.read_metadata(file_data)
      end
    end

    test "process_multiple/3 should correctly process files" do
      {:ok, file_data} = FileData.from_path("test/support/fixtures/image_file.png")

      user = Fixtures.fixture(:registered_user)
      file = Fixtures.fixture(:file, user)

      # Mocking the call chain
      with_mock(
        Image,
        open: fn stream -> {:ok, stream} end,
        thumbnail: fn stream, _size, _args ->
          {:ok, stream}
        end,
        stream!: fn stream, _opts ->
          stream
        end
      ) do
        # Assertion
        assert {:ok, _conversions} =
                 ImageProcessor.process_multiple(
                   file_data,
                   file,
                   AvailableFormats.list(:preview)
                 )

        conversions =
          file
          |> Repo.reload()
          |> Repo.preload(:file_conversions)
          |> Map.get(:file_conversions)

        assert Enum.count(conversions) == 3
      end
    end
  end
end
