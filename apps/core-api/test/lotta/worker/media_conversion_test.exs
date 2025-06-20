defmodule Lotta.Worker.MediaConversionTest do
  use Lotta.WorkerCase, async: true

  alias Lotta.Fixtures
  alias Lotta.Worker.MediaConversion

  alias Lotta.Storage.File

  @prefix "tenant_test"

  defmodule DummyStorage do
    def create_file_conversion(_file_data, _file, _format_name), do: {:ok, :conversion}
  end

  describe "check_args/1" do
    test "returns error if file not found" do
      args = %{
        "prefix" => @prefix,
        "file_id" => "0000a00a-00a0-00a0-00a0-00a000a000a0",
        "format_name" => "audioplay_aac"
      }

      assert MediaConversion.check_args(args) == {:error, "File not found"}
    end

    test "returns error if neither format_name nor format_names are provided" do
      user = Fixtures.fixture(:admin_user)
      file = Fixtures.fixture(:real_audio_file, user)

      assert {:error, _} =
               MediaConversion.check_args(%{"prefix" => @prefix, "file_id" => file.id})
    end

    test "returns error if both format_name and format_names are provided" do
      user = Fixtures.fixture(:admin_user)
      file = Fixtures.fixture(:real_audio_file, user)

      assert {:error, _} =
               MediaConversion.check_args(%{
                 "prefix" => @prefix,
                 "file_id" => file.id,
                 "format_name" => "audioplay_aac",
                 "format_names" => ["audioplay_ogg", "audioplay_mp3"]
               })
    end

    test "returns ok for single format" do
      user = Fixtures.fixture(:admin_user)
      file = Fixtures.fixture(:real_audio_file, user)

      args = %{
        "prefix" => @prefix,
        "file_id" => file.id,
        "format_name" => "audioplay_aac"
      }

      assert {:ok, %File{}, :format_name, "audioplay_aac"} = MediaConversion.check_args(args)
    end

    test "returns ok for multiple formats" do
      user = Fixtures.fixture(:admin_user)
      file = Fixtures.fixture(:real_audio_file, user)

      args = %{
        "prefix" => @prefix,
        "file_id" => file.id,
        "format_names" => ["audioplay_aac", "audioplay_ogg"]
      }

      assert {:ok, %File{}, :format_names, ["audioplay_aac", "audioplay_ogg"]} =
               MediaConversion.check_args(args)
    end
  end

  # describe "perform/1" do
  # end

  describe "await_completion_task/1" do
    test "immediately returns completed job" do
      job = %Oban.Job{id: 1, state: "completed"}
      task = MediaConversion.await_completion_task(job)
      assert Task.await(task) == {:ok, job}
    end

    test "returns error for unknown state" do
      job = %Oban.Job{id: 1, state: "discarded"}
      task = MediaConversion.await_completion_task(job)
      assert Task.await(task) == {:error, "discarded"}
    end
  end
end
