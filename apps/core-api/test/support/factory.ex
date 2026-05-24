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
  alias Lotta.Storage.{Directory, File}
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
    struct!(article_factory(), ready_to_publish: false, published: false, category: nil)
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
