defmodule Api.Content.Article do
  @moduledoc """
    Ecto Schema for articles
  """

  use Ecto.Schema
  alias Api.Repo
  import Ecto.Changeset
  import Ecto.Query
  alias Api.Mailer
  alias Api.System
  alias Api.Accounts.{File, User, UserGroup}
  alias Api.Content.{Article, ContentModule}
  alias Api.System.Category

  schema "articles" do
    field(:title, :string)
    field(:preview, :string)
    field(:topic, :string)
    field(:ready_to_publish, :boolean)
    field(:is_pinned_to_top, :boolean)

    belongs_to(:category, Category, on_replace: :nilify)
    belongs_to(:preview_image_file, File, on_replace: :nilify)
    has_many(:content_modules, ContentModule, on_replace: :delete)

    many_to_many(
      :groups,
      UserGroup,
      join_through: "articles_user_groups",
      join_keys: [article_id: :id, group_id: :id],
      on_replace: :delete
    )

    many_to_many(
      :users,
      User,
      join_through: "article_users",
      on_replace: :delete
    )

    timestamps()
  end

  def get_url(%Article{} = article) do
    System.get_main_url()
    |> String.replace_suffix(
      "",
      "/a/#{article.id}-#{Api.Slugifier.slugify_string(article.title)}"
    )
  end

  @doc false
  def create_changeset(article, attrs) do
    article
    |> Repo.preload([:category, :groups, :users, :preview_image_file, :content_modules])
    |> cast(attrs, [:title, :inserted_at])
    |> validate_required([:title])
  end

  @doc false
  def changeset(article, attrs) do
    article
    |> Repo.preload([:category, :groups, :users, :preview_image_file, :content_modules])
    |> cast(attrs, [:title, :inserted_at, :updated_at, :ready_to_publish, :preview, :topic])
    |> validate_required([:title])
    |> put_assoc_users(attrs)
    |> put_assoc_category(attrs)
    |> put_assoc_preview_image_file(attrs)
    |> put_assoc_groups(attrs)
    |> cast_assoc(:content_modules, required: false)
    |> maybe_send_admin_notification()
  end

  defp put_assoc_users(changeset, %{users: users}) do
    changeset
    |> put_assoc(:users, Repo.all(from(u in User, where: u.id in ^Enum.map(users, & &1.id))))
  end

  defp put_assoc_users(changeset, _), do: changeset

  defp put_assoc_category(changeset, %{category: %{id: category_id}}) do
    changeset
    |> put_assoc(:category, Repo.get(Category, category_id))
  end

  defp put_assoc_category(changeset, _), do: changeset

  defp put_assoc_preview_image_file(changeset, %{preview_image_file: %{id: preview_image_file_id}}) do
    changeset
    |> put_assoc(:preview_image_file, Repo.get(File, preview_image_file_id))
  end

  defp put_assoc_preview_image_file(changeset, %{preview_image_file: nil}) do
    changeset
    |> put_assoc(:preview_image_file, nil)
  end

  defp put_assoc_preview_image_file(changeset, _), do: changeset

  defp put_assoc_groups(changeset, %{groups: groups}) do
    changeset
    |> put_assoc(
      :groups,
      Repo.all(from(ug in UserGroup, where: ug.id in ^Enum.map(groups, & &1.id)))
    )
  end

  defp put_assoc_groups(changeset, _), do: changeset

  defp maybe_send_admin_notification(changeset) do
    if changeset.valid? && get_change(changeset, :ready_to_publish) do
      case apply_action(changeset, :update) do
        {:ok, article} ->
          # TODO: This should b moved to Accounts I think
          for admin <- Api.Accounts.list_admin_users() do
            Api.Email.article_ready_mail(admin, article)
            |> Mailer.deliver_later()
          end

        {:error, _} ->
          nil
      end
    end

    changeset
  end
end
