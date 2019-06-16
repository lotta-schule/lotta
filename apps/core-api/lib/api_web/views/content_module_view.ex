defmodule ApiWeb.ContentModuleView do
  use ApiWeb, :view
  alias ApiWeb.ContentModuleView

  def render("index.json", %{content_modules: content_modules}) do
    %{data: render_many(content_modules, ContentModuleView, "content_module.json")}
  end

  def render("show.json", %{content_module: content_module}) do
    %{data: render_one(content_module, ContentModuleView, "content_module.json")}
  end

  def render("content_module.json", %{content_module: content_module}) do
    %{id: content_module.id,
      type: content_module.type,
      text: content_module.text}
  end
end
