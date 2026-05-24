defmodule Lotta.Storage.FileProcessor.ImageProcessorTest do
  use Lotta.DataCase, async: true

  import Mox
  import Lotta.Factory

  alias Lotta.{Repo, Tenants}
  alias Lotta.Storage.FileData
  alias Lotta.Storage.Conversion.AvailableFormats
  alias Lotta.Storage.FileProcessor.ImageProcessor

  @prefix "tenant_test"

  setup :verify_on_exit!

  setup do
    Application.put_env(:lotta, :image_module, Lotta.ImageMock)
    on_exit(fn -> Application.delete_env(:lotta, :image_module) end)
    :ok
  end

  describe "read_metadata/1" do
    setup do
      Repo.put_prefix(@prefix)
      tenant = Tenants.get_tenant_by_prefix(@prefix)

      {:ok, %{tenant: tenant}}
    end

    test "returns metadata map on successful processing" do
      stub(Lotta.ImageMock, :open, fn _stream -> {:ok, :mock_image} end)
      stub(Lotta.ImageMock, :shape, fn _image -> {1920, 1080, 3} end)
      stub(Lotta.ImageMock, :pages, fn _image -> 1 end)
      stub(Lotta.ImageMock, :exif, fn _image -> {:ok, %{"make" => "camera_test"}} end)
      stub(Lotta.ImageMock, :dominant_color, fn _image -> {:ok, [255, 12, 123]} end)

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

    test "returns an error when image processing fails" do
      {:ok, file_data} = FileData.from_path("test/support/fixtures/image_file.png")

      stub(Lotta.ImageMock, :open, fn _stream -> {:error, "failed to open"} end)

      assert {:error, "failed to open"} == ImageProcessor.read_metadata(file_data)
    end

    test "process_multiple/3 should correctly process files" do
      {:ok, file_data} = FileData.from_path("test/support/fixtures/image_file.png")

      user = insert(:user)
      file = insert(:file, user_id: user.id)

      stub(Lotta.ImageMock, :open, fn stream -> {:ok, stream} end)
      stub(Lotta.ImageMock, :thumbnail, fn stream, _size, _args -> {:ok, stream} end)
      stub(Lotta.ImageMock, :stream!, fn stream, _opts -> stream end)

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
