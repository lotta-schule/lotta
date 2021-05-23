defmodule Api.Content.ContentModule do
  @moduledoc false

  use Ecto.Schema

  import Ecto.Changeset

  alias Api.Repo
  alias Api.Content.{Article, ContentModuleResult}
  alias Api.Storage.File

  @type id() :: String.t()

  @type t() :: %__MODULE__{
          id: id(),
          content: map(),
          type: String.t(),
          text: String.t(),
          sort_key: number(),
          configuration: map()
        }

  @timestamps_opts [type: :utc_datetime]

  schema "content_modules" do
    field :content, :map
    field :type, :string
    field :text, :string
    field :sort_key, :integer
    field :configuration, :map

    belongs_to :article, Article
    has_many :results, ContentModuleResult

    many_to_many :files,
                 File,
                 join_through: "content_module_file",
                 on_replace: :delete

    timestamps()
  end

  @doc false
  def changeset(content_module, attrs) do
    content_module
    |> Repo.preload(:files)
    |> cast(attrs, [:type, :content, :sort_key, :configuration])
    |> validate_required([:type, :sort_key])
    |> put_assoc_files(attrs)
  end

  defp put_assoc_files(content_module, %{files: files}) do
    files = Enum.map(files, fn file -> Repo.get!(File, file.id) end)

    content_module
    |> put_assoc(:files, files)
  end

  defp put_assoc_files(content_module, _attrs) do
    content_module
  end
end
