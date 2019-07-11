defmodule ApiWeb.FileView do
  use ApiWeb, :view
  alias ApiWeb.FileView

  def render("index.json", %{files: files}) do
    %{data: render_many(files, FileView, "file.json")}
  end

  def render("show.json", %{file: file}) do
    %{data: render_one(file, FileView, "file.json")}
  end

  def render("file.json", %{file: file}) do
    %{id: file.id,
      path: file.path,
      filename: file.filename,
      filesize: file.filesize,
      remote_location: file.remote_location,
      mime_type: file.mime_type,
      file_type: file.file_type}
  end
end
