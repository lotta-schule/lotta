defmodule Api.Content.ContentModule do
  use Ecto.Schema
  import Ecto.Changeset
  alias Api.Repo

  schema "content_modules" do
    field :text, :string
    field :type, :string
    field :sort_key, :integer
    field :configuration, :map

    belongs_to :article, Api.Content.Article
    has_many :results, Api.Content.ContentModuleResult
    many_to_many(
      :files,
      Api.Accounts.File,
      join_through: "content_module_file"
    )

    timestamps()
  end

  @doc false
  def changeset(content_module, attrs) do
    content_module
    |> Api.Repo.preload(:files)
    |> cast(attrs, [:type, :text, :sort_key, :configuration])
    |> validate_required([:type, :sort_key])
    |> put_assoc_files(attrs)
  end

  defp put_assoc_files(content_module, %{files: files}) do
    files = Enum.map(files, fn file -> Repo.get!(Api.Accounts.File, file.id) end)
    content_module
    |> put_assoc(:files, files)
  end
  defp put_assoc_files(content_module, _attrs) do
    content_module
    |> put_assoc(:files, [])
  end
end
