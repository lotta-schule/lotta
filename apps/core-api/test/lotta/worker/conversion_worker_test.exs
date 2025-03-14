defmodule Lotta.ConversionWorkerTest do
  use Lotta.WorkerCase, async: true

  alias Lotta.{ConversionWorker, Fixtures}

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

  describe "ConversionWorker" do
    test "Create a new image conversion" do
      file = Fixtures.fixture(:real_image_file, Fixtures.fixture(:admin_user))

      {:ok, conversions} =
        perform_job(ConversionWorker, %{
          "prefix" => "tenant_test",
          "file_id" => file.id,
          "format_category" => "preview"
        })

      assert Enum.count(conversions) == 7
    end

    test "should get an existing job after calling get_or_create_conversion_job with args of existing job" do
      with_testing_mode(:manual, fn ->
        file = Fixtures.fixture(:real_image_file, Fixtures.fixture(:admin_user))

        assert {:ok, _job} =
                 ConversionWorker.get_or_create_conversion_job(file, "preview")

        assert jobs = all_enqueued(worker: ConversionWorker)
        ConversionWorker.get_or_create_conversion_job(file, "preview")
        assert jobs == all_enqueued(worker: ConversionWorker)

        assert_enqueued(
          queue: :file_conversion,
          args: %{file_id: file.id, format_category: "preview"}
        )

        assert %{success: 1} =
                 Oban.drain_queue(queue: :file_conversion)
      end)
    end
  end
end
