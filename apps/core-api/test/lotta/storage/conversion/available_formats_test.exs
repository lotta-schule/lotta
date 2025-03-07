defmodule Lotta.Storage.Conversion.AvailableFormatsTest do
  @moduledoc false

  use Lotta.DataCase

  import Ecto.Query

  alias Lotta.Storage.File
  alias Lotta.Storage.Conversion.AvailableFormats

  @prefix "tenant_test"

  @preview_categories [:preview]

  @preview_formats [
    :preview_200,
    :preview_400,
    :preview_800,
    :preview_1200,
    :preview_1600,
    :preview_2400,
    :preview_3200
  ]

  @image_format_categories [
    :preview,
    :avatar,
    :logo,
    :banner,
    :articlepreview,
    :pagebg,
    :icon
  ]

  @video_format_categories [
    :webm,
    :h264
  ]

  setup do
    Repo.put_prefix(@prefix)

    image_file =
      Repo.one!(from(f in File, where: f.filename == ^"ich_schoen.jpg"))

    video_file =
      Repo.one!(from(f in File, where: f.filename == ^"podcast5.mp4"))

    pdf_file =
      Repo.one!(from(f in File, where: f.filename == ^"wettbewerb.pdf"))

    binary_file =
      Repo.one!(from(f in File, where: f.filename == ^"secrets.zip"))

    {:ok,
     %{
       image_file: image_file,
       binary_file: binary_file,
       pdf_file: pdf_file,
       video_file: video_file
     }}
  end

  describe "get 'immediate' formats" do
    test "list/0 should list all formats" do
      assert is_list(AvailableFormats.list())
    end

    test "list/1 should list all formats for a given category" do
      assert @preview_formats == Keyword.keys(AvailableFormats.list(:preview))
    end

    test "get_immediate_format/1 should return all preview formats for an image file", %{
      image_file: image_file,
      binary_file: binary_file,
      video_file: video_file
    } do
      assert AvailableFormats.get_immediate_formats(image_file) == @preview_categories
      assert AvailableFormats.get_immediate_formats(video_file) == []
      assert AvailableFormats.get_immediate_formats(binary_file) == []
    end

    test "get_immediate_formats/1 should return all preview formats for a given mime type" do
      assert AvailableFormats.get_immediate_formats("image/jpg") == @preview_categories
      assert AvailableFormats.get_immediate_formats("image/png") == @preview_categories
      assert AvailableFormats.get_immediate_formats("application/svg") == @preview_categories

      assert AvailableFormats.get_immediate_formats("video/mp4") == []
      assert AvailableFormats.get_immediate_formats("video/webm") == []

      assert AvailableFormats.get_immediate_formats("application/pdf") == @preview_categories
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
             |> Enum.all?(&Enum.member?([:preview | @video_format_categories], &1))

      assert Enum.all?(@video_format_categories, fn cat_name ->
               Enum.any?(
                 video_formats,
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
  end
end
