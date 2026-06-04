defmodule Lotta.Worker.MediaConversionTest do
  use Lotta.WorkerCase, async: false

  import Mox
  import Lotta.Factory

  alias Lotta.Repo
  alias Lotta.Worker.MediaConversion

  alias Lotta.Storage.{File, FileConversion}

  @prefix "tenant_test"

  setup :verify_on_exit!

  setup do
    Repo.put_prefix(@prefix)
    :ok
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
      file = real_audio_file(insert(:user))

      assert {:error, _} =
               MediaConversion.check_args(%{"prefix" => @prefix, "file_id" => file.id})
    end

    test "returns error if both format_name and format_names are provided" do
      file = real_audio_file(insert(:user))

      assert {:error, _} =
               MediaConversion.check_args(%{
                 "prefix" => @prefix,
                 "file_id" => file.id,
                 "format_name" => "audioplay_aac",
                 "format_names" => ["audioplay_ogg", "audioplay_mp3"]
               })
    end

    test "returns ok for single format" do
      file = real_audio_file(insert(:user))

      args = %{
        "prefix" => @prefix,
        "file_id" => file.id,
        "format_name" => "audioplay_aac"
      }

      assert {:ok, %File{}, :format_name, "audioplay_aac"} = MediaConversion.check_args(args)
    end

    test "returns ok for multiple formats" do
      file = real_audio_file(insert(:user))

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
    setup do
      Application.put_env(:lotta, :exile_module, Lotta.ExileMock)
      on_exit(fn -> Application.delete_env(:lotta, :exile_module) end)

      Tesla.Mock.mock(fn
        %{method: :get} ->
          %Tesla.Env{
            status: 200,
            body: create_file_stream("test/support/fixtures/eoa2.mp3")
          }
      end)

      :ok
    end

    test "Create a single new audio conversion" do
      file = real_audio_file(insert(:user))

      stub(Lotta.ExileMock, :stream!, fn _cmd, _opts ->
        create_file_stream("test/support/fixtures/eoa2.mp3")
        |> Stream.map(&{:stdout, &1})
      end)

      :ok =
        perform_job(MediaConversion, %{
          "prefix" => @prefix,
          "file_id" => file.id,
          "format_name" => "audioplay_aac"
        })

      assert [%FileConversion{format: "audioplay_aac", file_type: "audio"}] =
               file
               |> Repo.reload()
               |> Repo.preload(:file_conversions)
               |> Map.get(:file_conversions)
    end

    test "Create multiple new audio conversions" do
      file = real_audio_file(insert(:user))

      stub(Lotta.ExileMock, :stream!, fn _cmd, _opts ->
        create_file_stream("test/support/fixtures/eoa2.mp3")
        |> Stream.map(&{:stdout, &1})
      end)

      :ok =
        perform_job(MediaConversion, %{
          "prefix" => @prefix,
          "file_id" => file.id,
          "format_names" => ["audioplay_aac", "audioplay_ogg", "preview_200"]
        })

      file_conversions =
        file
        |> Repo.reload()
        |> Repo.preload(:file_conversions)
        |> Map.get(:file_conversions)

      assert Enum.count(file_conversions) == 3

      assert Enum.any?(file_conversions, fn fc ->
               fc.format == "audioplay_aac" and fc.file_type == "audio"
             end)

      assert Enum.any?(file_conversions, fn fc ->
               fc.format == "audioplay_ogg" and fc.file_type == "audio"
             end)

      assert Enum.any?(file_conversions, fn fc ->
               fc.format == "preview_200" and fc.file_type == "image"
             end)
    end

    test "Create multiple new video conversions" do
      file = real_video_file(insert(:user))

      stub(Lotta.ExileMock, :stream!, fn _cmd, _opts ->
        create_file_stream("test/support/fixtures/pc3.m4v")
        |> Stream.map(&{:stdout, &1})
      end)

      :ok =
        perform_job(MediaConversion, %{
          "prefix" => @prefix,
          "file_id" => file.id,
          "format_names" => ["videoplay_480p-webm", "preview_200", "poster_1080p"]
        })

      file_conversions =
        file
        |> Repo.reload()
        |> Repo.preload(:file_conversions)
        |> Map.get(:file_conversions)

      assert Enum.count(file_conversions) == 3

      assert Enum.any?(file_conversions, fn fc ->
               fc.format == "videoplay_480p-webm" and fc.file_type == "video"
             end)

      assert Enum.any?(file_conversions, fn fc ->
               fc.format == "preview_200" and fc.file_type == "image"
             end)

      assert Enum.any?(file_conversions, fn fc ->
               fc.format == "poster_1080p" and fc.file_type == "image"
             end)
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
