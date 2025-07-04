defmodule Lotta.Worker.ConversionTest do
  use Lotta.WorkerCase, async: true

  import Mock

  alias Lotta.Fixtures
  alias Lotta.Worker.Conversion

  setup do
    Tesla.Mock.mock(fn
      %{method: :get} ->
        %Tesla.Env{
          status: 200,
          body:
            "test/support/fixtures/image_file.png"
            |> File.open!()
            |> IO.binstream(5 * 1024 * 1024)
        }
    end)
  end

  describe "Worker.Conversion" do
    test "Create a new image conversion" do
      file = Fixtures.fixture(:real_image_file, Fixtures.fixture(:admin_user))

      {:ok, conversions} =
        perform_job(Conversion, %{
          "prefix" => "tenant_test",
          "file_id" => file.id,
          "format_category" => "preview"
        })

      assert Enum.count(conversions) == 3
    end

    test "cancel a job when a format was passed vips cannot read" do
      file = Fixtures.fixture(:real_file, Fixtures.fixture(:admin_user))

      with_mock(
        Image,
        open: fn _stream -> {:error, "Failed to create image from VipsSource"} end
      ) do
        assert {:cancel, _msg} =
                 perform_job(Conversion, %{
                   "prefix" => "tenant_test",
                   "file_id" => file.id,
                   "format_category" => "preview"
                 })
      end
    end

    test "should get an existing job after calling get_or_create_conversion_job with args of existing job" do
      with_testing_mode(:manual, fn ->
        file = Fixtures.fixture(:real_image_file, Fixtures.fixture(:admin_user))

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
