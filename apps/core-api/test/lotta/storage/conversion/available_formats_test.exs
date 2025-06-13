defmodule Lotta.Storage.Conversion.AvailableFormatsTest do
  @moduledoc false

  use Lotta.DataCase

  import Ecto.Query
  import Lotta.Storage.Conversion.AvailableFormats, only: [is_valid_category?: 1]

  alias Lotta.Storage.{File, FileData}
  alias Lotta.Storage.Conversion.AvailableFormats

  @prefix "tenant_test"

  @preview_formats [
    :preview_200,
    :preview_400,
    :preview_800
  ]

  @image_format_categories [
    :preview,
    :present,
    :avatar,
    :logo,
    :banner,
    :articlepreview,
    :pagebg,
    :icon
  ]

  @video_format_categories [
    :videoplay
  ]

  @audio_format_categories [
    :audioplay
  ]

  setup do
    Repo.put_prefix(@prefix)

    image_file =
      Repo.one!(from(f in File, where: f.filename == ^"ich_schoen.jpg"))

    video_file =
      Repo.one!(from(f in File, where: f.filename == ^"podcast5.mp4"))

    audio_file =
      Repo.one!(from(f in File, where: f.filename == ^"eoa2.mp3"))

    pdf_file =
      Repo.one!(from(f in File, where: f.filename == ^"wettbewerb.pdf"))

    binary_file =
      Repo.one!(from(f in File, where: f.filename == ^"secrets.zip"))

    {:ok,
     %{
       image_file: image_file,
       binary_file: binary_file,
       pdf_file: pdf_file,
       video_file: video_file,
       audio_file: audio_file
     }}
  end

  describe "get 'immediate' formats" do
    test "list/0 should list all formats" do
      assert is_list(AvailableFormats.list())
    end

    test "list/1 should list all formats for a given category" do
      assert @preview_formats == Keyword.keys(AvailableFormats.list(:preview))
    end

    test "is_valid_category?/1 should return if category exists" do
      assert match?(category when is_valid_category?(category), :preview)
    end

    test "get_immediate_format/1 should return all preview formats for a file", %{
      image_file: image_file,
      audio_file: audio_file,
      video_file: video_file
    } do
      assert AvailableFormats.get_immediate_formats(image_file) == [:preview]
      assert AvailableFormats.get_immediate_formats(video_file) == [:preview, :poster]
      assert AvailableFormats.get_immediate_formats(audio_file) == [:preview]
    end

    test "get_immediate_format/1 should return all preview formats for a file data" do
      {:ok, image_file_data} =
        FileData.from_path("test/support/fixtures/image_file.png", mime_type: "image/png")

      {:ok, video_file_data} =
        FileData.from_path("test/support/fixtures/podcast1.mp4", mime_type: "video/mp4")

      {:ok, audio_file_data} =
        FileData.from_path("test/support/fixtures/eoa2.mp3", mime_type: "audio/mpeg")

      assert AvailableFormats.get_immediate_formats(image_file_data) == [
               :preview
             ]

      assert AvailableFormats.get_immediate_formats(video_file_data) == [
               :preview,
               :poster
             ]

      assert AvailableFormats.get_immediate_formats(audio_file_data) == [:preview]
    end

    test "get_immediate_formats/1 should return all preview formats for a given mime type" do
      assert AvailableFormats.get_immediate_formats("image/jpg") == [:preview]
      assert AvailableFormats.get_immediate_formats("image/png") == [:preview]
      assert AvailableFormats.get_immediate_formats("application/svg") == [:preview]

      assert AvailableFormats.get_immediate_formats("video/mp4") == [:preview, :poster]
      assert AvailableFormats.get_immediate_formats("video/webm") == [:preview, :poster]

      assert AvailableFormats.get_immediate_formats("application/pdf") == [:preview]
      assert AvailableFormats.get_immediate_formats("application/zip") == []
    end
  end

  describe "get possible formats" do
    test "image file: available_formats/1 should return all image formats", %{
      image_file: image_file
    } do
      image_formats = AvailableFormats.available_formats(image_file)
      assert Enum.all?(image_formats, &is_atom/1)

      image_formats = Enum.map(image_formats, &to_string/1)

      assert image_formats
             |> Enum.map(&String.to_existing_atom(List.first(String.split(&1, "_"))))
             |> Enum.all?(&Enum.member?(@image_format_categories, &1))

      assert Enum.all?(@image_format_categories, fn cat_name ->
               Enum.any?(
                 image_formats,
                 &String.starts_with?(&1, to_string(cat_name))
               )
             end)
    end

    test "video file: available_formats/1 should return preview formats and video formats", %{
      video_file: video_file
    } do
      video_formats = AvailableFormats.available_formats(video_file)
      assert Enum.all?(video_formats, &is_atom/1)

      video_formats = Enum.map(video_formats, &to_string/1)

      assert video_formats
             |> Enum.map(&String.to_existing_atom(List.first(String.split(&1, "_"))))
             |> Enum.all?(&Enum.member?([:preview, :poster | @video_format_categories], &1))

      assert Enum.all?(@video_format_categories, fn cat_name ->
               Enum.any?(
                 video_formats,
                 &String.starts_with?(&1, to_string(cat_name))
               )
             end)
    end

    test "audio file: available_formats/1 should return preview formats and audio formats", %{
      audio_file: audio_file
    } do
      audio_formats = AvailableFormats.available_formats(audio_file)
      assert Enum.all?(audio_formats, &is_atom/1)

      audio_formats = Enum.map(audio_formats, &to_string/1)

      assert audio_formats
             |> Enum.map(&String.to_existing_atom(List.first(String.split(&1, "_"))))
             |> Enum.all?(&Enum.member?([:preview | @audio_format_categories], &1))

      assert Enum.all?(@audio_format_categories, fn cat_name ->
               Enum.any?(
                 audio_formats,
                 &String.starts_with?(&1, to_string(cat_name))
               )
             end)
    end

    test "pdf file: available_formats/1 should return only preview formats", %{
      pdf_file: pdf_file
    } do
      pdf_formats = AvailableFormats.available_formats(pdf_file)
      assert Enum.all?(pdf_formats, &is_atom/1)

      assert Enum.all?(pdf_formats, &String.starts_with?(to_string(&1), "preview_"))
    end

    test "binary file: available_formats/1 should return only preview formats", %{
      binary_file: binary_file
    } do
      assert AvailableFormats.available_formats(binary_file) == []
    end

    test "get_formats_for/1" do
      assert AvailableFormats.get_formats_for(:preview) == @preview_formats
      assert AvailableFormats.get_formats_for("preview") == @preview_formats
    end
  end

  describe "valid_category?/1" do
    test "valid categories should return true" do
      assert AvailableFormats.valid_category?(:preview)
      assert AvailableFormats.valid_category?(:present)
      assert AvailableFormats.valid_category?(:avatar)
      assert AvailableFormats.valid_category?(:logo)
      assert AvailableFormats.valid_category?(:banner)
      assert AvailableFormats.valid_category?(:articlepreview)
      assert AvailableFormats.valid_category?(:pagebg)
      assert AvailableFormats.valid_category?(:icon)
      assert AvailableFormats.valid_category?(:videoplay)
    end

    test "invalid categories should return false" do
      refute AvailableFormats.valid_category?(:unknown)
      refute AvailableFormats.valid_category?("preview")
    end
  end
end
