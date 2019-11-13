defmodule ApiWeb.UserGroupView do
  use ApiWeb, :view
  alias ApiWeb.UserGroupView

  def render("index.json", %{user_group: user_group}) do
    %{data: render_many(user_group, UserGroupView, "user_group.json")}
  end

  def render("show.json", %{user_group: user_group}) do
    %{data: render_one(user_group, UserGroupView, "user_group.json")}
  end

  def render("user_group.json", %{user_group: user_group}) do
    %{id: user_group.id,
      name: user_group.name,
      sort_key: user_group.sort_key}
  end
end
