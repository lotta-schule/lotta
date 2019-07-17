defmodule ApiWeb.FileConversionView do
  use ApiWeb, :view
  alias ApiWeb.FileConversionView

  def render("index.json", %{file_conversions: file_conversions}) do
    %{data: render_many(file_conversions, FileConversionView, "file_conversion.json")}
  end

  def render("show.json", %{file_conversion: file_conversion}) do
    %{data: render_one(file_conversion, FileConversionView, "file_conversion.json")}
  end

  def render("file_conversion.json", %{file_conversion: file_conversion}) do
    %{id: file_conversion.id,
      format: file_conversion.format,
      remote_location: file_conversion.remote_location,
      mime_type: file_conversion.mime_type,
      file_type: file_conversion.file_type}
  end
end
