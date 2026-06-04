defmodule Lotta.Worker.ConversionTest do
  use Lotta.WorkerCase, async: false

  import Mox
  import Lotta.Factory

  alias Lotta.Repo
  alias Lotta.Worker.Conversion

  setup :verify_on_exit!

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)

    Tesla.Mock.mock(fn
      %{method: :get} ->
        %Tesla.Env{
          status: 200,
          body:
            "test/support/fixtures/image_file.png"
            |> Elixir.File.open!()
            |> IO.binstream(5 * 1024 * 1024)
        }
    end)
  end

  describe "Worker.Conversion" do
    test "Create a new image conversion" do
      file = real_image_file(insert(:user))

      {:ok, conversions} =
        perform_job(Conversion, %{
          "prefix" => "tenant_test",
          "file_id" => file.id,
          "format_category" => "preview"
        })

      assert Enum.count(conversions) == 3
    end

    test "cancel a job when a format was passed vips cannot read" do
      file = real_file(insert(:user))

      Application.put_env(:lotta, :image_module, Lotta.ImageMock)
      on_exit(fn -> Application.delete_env(:lotta, :image_module) end)

      stub(Lotta.ImageMock, :open, fn _stream ->
        {:error, %Image.Error{message: "Failed to create image from VipsSource"}}
      end)

      assert {:cancel, _msg} =
               perform_job(Conversion, %{
                 "prefix" => "tenant_test",
                 "file_id" => file.id,
                 "format_category" => "preview"
               })
    end

    test "should get an existing job after calling get_or_create_conversion_job with args of existing job" do
      with_testing_mode(:manual, fn ->
        file = real_image_file(insert(:user))

        assert {:ok, _job} =
                 Conversion.get_or_create_conversion_job(file, "preview")

        assert jobs = all_enqueued(worker: Conversion)
        Conversion.get_or_create_conversion_job(file, "preview")
        assert jobs == all_enqueued(worker: Conversion)

        assert_enqueued(
          queue: :file_conversion,
          args: %{"file_id" => file.id, "format_category" => "preview"}
        )

        assert %{success: 1} =
                 Oban.drain_queue(queue: :file_conversion)
      end)
    end
  end
end
