defmodule ApiWeb.ContentModuleController do
  use ApiWeb, :controller

  alias Api.Content
  alias Api.Content.ContentModule

  action_fallback ApiWeb.FallbackController

  def index(conn, _params) do
    content_modules = Content.list_content_modules()
    render(conn, "index.json", content_modules: content_modules)
  end

  def create(conn, %{"content_module" => content_module_params}) do
    with {:ok, %ContentModule{} = content_module} <- Content.create_content_module(content_module_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.content_module_path(conn, :show, content_module))
      |> render("show.json", content_module: content_module)
    end
  end

  def show(conn, %{"id" => id}) do
    content_module = Content.get_content_module!(id)
    render(conn, "show.json", content_module: content_module)
  end

  def update(conn, %{"id" => id, "content_module" => content_module_params}) do
    content_module = Content.get_content_module!(id)

    with {:ok, %ContentModule{} = content_module} <- Content.update_content_module(content_module, content_module_params) do
      render(conn, "show.json", content_module: content_module)
    end
  end

  def delete(conn, %{"id" => id}) do
    content_module = Content.get_content_module!(id)

    with {:ok, %ContentModule{}} <- Content.delete_content_module(content_module) do
      send_resp(conn, :no_content, "")
    end
  end
end
