defmodule ApiWeb.CategoryController do
  use ApiWeb, :controller

  alias Api.Tenants
  alias Api.Tenants.Category

  action_fallback ApiWeb.FallbackController

  def index(conn, _params) do
    categories = Tenants.list_categories()
    render(conn, "index.json", categories: categories)
  end

  def create(conn, %{"category" => category_params}) do
    with {:ok, %Category{} = category} <- Tenants.create_category(category_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.category_path(conn, :show, category))
      |> render("show.json", category: category)
    end
  end

  def show(conn, %{"id" => id}) do
    category = Tenants.get_category!(id)
    render(conn, "show.json", category: category)
  end

  def update(conn, %{"id" => id, "category" => category_params}) do
    category = Tenants.get_category!(id)

    with {:ok, %Category{} = category} <- Tenants.update_category(category, category_params) do
      render(conn, "show.json", category: category)
    end
  end

  def delete(conn, %{"id" => id}) do
    category = Tenants.get_category!(id)

    with {:ok, %Category{}} <- Tenants.delete_category(category) do
      send_resp(conn, :no_content, "")
    end
  end
end
