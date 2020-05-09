defmodule Api.Repo.Migrations.AddContentToContentModule do
  alias Api.Content.ContentModule
  alias Api.Repo
  use Ecto.Migration
  import Ecto.Query
  import Ecto.Changeset

  def up do
    alter table(:content_modules) do
      add :content, :json, default: "{}"
    end

    flush()

    from(cm in ContentModule, where: cm.type == "text")
    |> Api.Repo.all()
    |> Enum.each(fn content_module ->
      content = try do
        content_module.text |> Base.decode64! |> URI.decode |> Jason.decode!
      rescue
        _ ->
          content_module.text |> Base.decode64! |> Jason.decode!
      end
      content_module
      |> change(%{ content: %{ "nodes" => content }})
      |> Repo.update()
    end)

    from(cm in ContentModule, where: cm.type == "title")
    |> Api.Repo.all()
    |> Enum.each(fn content_module ->
      content_module
      |> change(%{ content: %{"title" => content_module.text} })
      |> Repo.update()
    end)

    from(cm in ContentModule, where: cm.type in ["image_collection", "audio", "video"])
    |> Api.Repo.all()
    |> Enum.filter(fn content_module -> !is_nil(content_module.text) end)
    |> Enum.each(fn content_module ->
      content_module
      |> change(%{ content: %{ captions: Jason.decode!(content_module.text) } })
      |> Repo.update()
    end)

    from(cm in ContentModule, where: cm.type == "image")
    |> Api.Repo.all()
    |> Enum.filter(fn content_module -> !is_nil(content_module.text) end)
    |> Enum.each(fn content_module ->
      content_module
      |> change(%{ content: %{ caption: Enum.at(Jason.decode!(content_module.text), 0) } })
      |> Repo.update()
    end)

  end

  def down do
    alter table(:content_modules) do
      remove :content
    end
  end
end
