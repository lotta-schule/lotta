defmodule Lotta.Factory do
  @moduledoc false
  use ExMachina.Ecto, repo: Lotta.Repo

  # Override insert/1 to automatically inject the process-local tenant prefix.
  # This is required because ExMachina calls Repo.insert! without a prefix option,
  # but Repo.prepare_query (which handles prefix injection) is only called for
  # query operations — not for schema-level inserts. Overriding here ensures that
  # insert(:user) respects Repo.put_prefix("tenant_test") set in test setup.
  defoverridable insert: 1

  def insert(factory_name) when is_atom(factory_name) do
    case Lotta.Repo.get_prefix() do
      nil -> super(factory_name)
      prefix -> insert(factory_name, %{}, prefix: prefix)
    end
  end

  def insert(%{__meta__: _} = record) do
    case Lotta.Repo.get_prefix() do
      nil -> super(record)
      prefix -> insert(record, prefix: prefix)
    end
  end

  alias Lotta.{Calendar, Accounts}
  alias Lotta.Tenants.{Category, Widget}
  alias Lotta.Content.{Article, ContentModule}
  alias Lotta.Storage.{Directory, File, FileData, RemoteStorage}
  alias Lotta.Messages.{Conversation, Message}

  # --- Accounts ---

  def group_factory do
    %Accounts.UserGroup{
      name: sequence(:name, &"group-#{&1}"),
      sort_key: sequence(:sort_key, & &1),
      is_admin_group: false
    }
  end

  def admin_group_factory do
    struct!(group_factory(), is_admin_group: true)
  end

  def user_factory do
    %Accounts.User{
      name: sequence(:name, &"user-#{&1}"),
      nickname: sequence(:nickname, &Enum.at(["Napo", "Billy", "Eike", "Lotta"], rem(&1, 4))),
      email: sequence(:email, &"user-#{&1}@lotta.schule"),
      password: "password",
      class: "5",
      hide_full_name: false
    }
  end

  def admin_user_factory do
    struct!(user_factory(), groups: [build(:admin_group)])
  end

  # --- Tenants ---

  def category_factory do
    %Category{
      title: sequence(:title, &"category-#{&1}"),
      sort_key: sequence(:sort_key, & &1),
      is_sidenav: false,
      is_homepage: false,
      hide_articles_from_homepage: false
    }
  end

  def homepage_category_factory do
    struct!(category_factory(), is_homepage: true)
  end

  def widget_factory do
    %Widget{
      title: sequence(:title, &"widget-#{&1}"),
      type: "schedule",
      configuration: %{}
    }
  end

  # --- Content ---

  def article_factory do
    %Article{
      title: sequence(:title, &"article-#{&1}"),
      preview: sequence(:preview, &"preview-#{&1}"),
      tags: [],
      ready_to_publish: true,
      published: true,
      is_pinned_to_top: false
    }
  end

  def unpublished_article_factory do
    struct!(article_factory(), ready_to_publish: true, published: false, category: nil)
  end

  def content_module_factory do
    %ContentModule{
      type: "text",
      content: %{},
      sort_key: sequence(:sort_key, & &1),
      configuration: %{}
    }
  end

  # --- Storage ---

  def directory_factory do
    %Directory{
      name: sequence(:name, &"directory-#{&1}")
    }
  end

  def file_factory do
    %File{
      filename: sequence(:filename, &"file-#{&1}.jpg"),
      filesize: 1024,
      file_type: "image",
      mime_type: "image/jpeg"
    }
  end

  # --- Messages ---

  def conversation_factory do
    %Conversation{}
  end

  def message_factory do
    %Message{
      content: sequence(:content, &"message content #{&1}")
    }
  end

  # --- Helpers ---

  @doc """
  Adds users (many_to_many) to an article, conversation, or content-module after it is persisted.
  ExMachina does not insert join-table rows automatically for many_to_many.
  """
  def with_users(record, users) do
    record
    |> Lotta.Repo.preload(:users)
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:users, users)
    |> Lotta.Repo.update!()
  end

  @doc "Adds groups (many_to_many) to a conversation after it is persisted."
  def with_groups(record, groups) do
    record
    |> Lotta.Repo.preload(:groups)
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:groups, groups)
    |> Lotta.Repo.update!()
  end

  @doc "Uploads a local file to remote storage and attaches it to a `%File{}` record."
  def with_remote_storage(file, local_path) do
    {:ok, file_data} = FileData.from_path(local_path)
    storage_path = Enum.join([Lotta.Repo.get_prefix(), file.id, "original"], "/")
    {:ok, entity_data} = RemoteStorage.create(file_data, storage_path)

    file
    |> Lotta.Repo.preload(:remote_storage_entity)
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:remote_storage_entity, entity_data)
    |> Lotta.Repo.update!()
  end

  def real_file(user) do
    insert(:file, user_id: user.id)
    |> with_remote_storage("test/support/fixtures/secrets.zip")
  end

  def real_image_file(user) do
    insert(:file, user_id: user.id, file_type: "image", mime_type: "image/jpeg")
    |> with_remote_storage("test/support/fixtures/image_file.png")
  end

  def real_audio_file(user) do
    dir = insert(:directory, user_id: user.id)

    insert(:file,
      user_id: user.id,
      filename: "some_filename",
      file_type: "audio",
      mime_type: "audio/mp3",
      parent_directory_id: dir.id
    )
    |> with_remote_storage("test/support/fixtures/eoa2.mp3")
  end

  def real_video_file(user) do
    dir = insert(:directory, user_id: user.id)

    insert(:file,
      user_id: user.id,
      filename: "some_filename",
      file_type: "video",
      mime_type: "video/mp4",
      parent_directory_id: dir.id
    )
    |> with_remote_storage("test/support/fixtures/pc3.m4v")
  end

  # --- Calendar ---

  def calendar_factory do
    %Calendar.Calendar{
      name: sequence(:name, &"calendar-#{&1}"),
      color: sequence(:color, &Enum.at(["#FF0000", "#00FF00", "#0000FF"], rem(&1, 3)))
    }
  end

  def publicly_available_calendar_factory do
    struct!(calendar_factory(), is_publicly_available: true)
  end

  def calendar_event_factory do
    %Calendar.CalendarEvent{
      summary: sequence(:title, &"event-#{&1}"),
      description: sequence(:description, &"description-#{&1}"),
      start: sequence(:start_date, &DateTime.add(~U[2021-01-01 08:30:00Z], &1)),
      end: sequence(:end_date, &DateTime.add(~U[2021-01-01 10:00:00Z], &1)),
      is_full_day: false
    }
  end
end
