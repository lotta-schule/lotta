defmodule Lotta.Worker.MediaConversionTest do
  use Lotta.WorkerCase, async: true

  import Mock

  alias Lotta.Fixtures
  alias Lotta.Worker.MediaConversion

  alias Lotta.Repo
  alias Lotta.Storage.{File, FileConversion}

  @prefix "tenant_test"

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

  describe "Worker.Conversion" do
    defp create_file_stream(file_path),
      do:
        file_path
        |> Elixir.File.open!()
        |> IO.binstream(5 * 1024 * 1024)

    setup do
      Tesla.Mock.mock(fn
        %{method: :get} = env ->
          %Tesla.Env{
            status: 200,
            body: create_file_stream("test/support/fixtures/eoa2.mp3")
          }
      end)
    end

    test "Create a single new audio conversion" do
      user = Fixtures.fixture(:admin_user)
      file = Fixtures.fixture(:real_audio_file, user)

      with_mock(
        Exile,
        stream!: fn cmd, _opts ->
          create_file_stream("test/support/fixtures/eoa2.mp3")
          |> Stream.map(&{:stdout, &1})
        end
      ) do
        :ok =
          perform_job(MediaConversion, %{
            "prefix" => @prefix,
            "file_id" => file.id,
            "format_name" => "audioplay_aac"
          })

        assert Mock.called(Exile.stream!(:_, :_))

        assert [%FileConversion{format: "audioplay_aac", file_type: "audio"} = file_conversion] =
                 file
                 |> Repo.reload()
                 |> Repo.preload(:file_conversions)
                 |> Map.get(:file_conversions)
      end
    end

    test "Create multiple new audio conversions" do
      user = Fixtures.fixture(:admin_user)
      file = Fixtures.fixture(:real_audio_file, user)

      with_mock(
        Exile,
        stream!: fn cmd, _opts ->
          create_file_stream("test/support/fixtures/eoa2.mp3")
          |> Stream.map(&{:stdout, &1})
        end
      ) do
        :ok =
          perform_job(MediaConversion, %{
            "prefix" => @prefix,
            "file_id" => file.id,
            "format_names" => ["audioplay_aac", "audioplay_ogg"]
          })

        Mock.assert_called_exactly(Exile.stream!(:_, :_), 2)

        file_conversions =
          file
          |> Repo.reload()
          |> Repo.preload(:file_conversions)
          |> Map.get(:file_conversions)

        assert Enum.count(file_conversions) == 2

        assert Enum.any?(file_conversions, fn fc ->
                 fc.format == "audioplay_aac" and fc.file_type == "audio"
               end)

        assert Enum.any?(file_conversions, fn fc ->
                 fc.format == "audioplay_ogg" and fc.file_type == "audio"
               end)
      end
    end
  end

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
