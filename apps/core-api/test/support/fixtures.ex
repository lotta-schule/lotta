defmodule Lotta.Fixtures do
  @moduledoc false

  import Ecto.Query

  alias Lotta.Repo
  alias Lotta.Tenants.Category
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Storage.{File, FileData}
  alias Lotta.Content.{Article}
  alias Lotta.Messages.{Conversation, Message}

  @prefix "tenant_test"

  def fixture(name, params \\ %{})

  def fixture(:valid_tenant_attrs, _) do
    %{
      title: "Meine andere Schule",
      slug: "meine-andere-schule",
      prefix: "t_other",
      logo_image_file_id: nil,
      background_image_file_id: nil
    }
  end

  def fixture(:valid_category_attrs, _) do
    %{
      title: "Meine Kategorie",
      sort_key: 10,
      is_sidenav: false,
      is_homepage: false,
      hide_articles_from_homepage: false
    }
  end

  def fixture(:category, _) do
    {:ok, category} =
      Category
      |> struct(fixture(:valid_category_attrs))
      |> Repo.insert(on_conflict: :nothing, prefix: @prefix)

    category
  end

  # Account

  def fixture(:valid_user_group_attrs, is_admin_group: is_admin_group) do
    %{
      name: "Meine Gruppe",
      sort_key: if(is_admin_group, do: 1000, else: 500),
      is_admin_group: is_admin_group
    }
  end

  def fixture(:user_group, is_admin_group: true) do
    %UserGroup{}
    |> Map.merge(fixture(:valid_user_group_attrs, is_admin_group: true))
    |> Repo.insert!(prefix: @prefix)
  end

  def fixture(:user_group, _) do
    %UserGroup{}
    |> Map.merge(fixture(:valid_user_group_attrs, is_admin_group: false))
    |> Repo.insert!(prefix: @prefix)
  end

  def fixture(:valid_user_attrs, _) do
    %{
      email: "some@email.de",
      name: "Alberta Smith",
      nickname: "TheNick",
      class: "5",
      password: "password",
      hide_full_name: false
    }
  end

  def fixture(:valid_admin_attrs, _) do
    %{
      email: "meineschule@lotta.schule",
      name: "Admin Didang",
      nickname: "TheAdmin",
      class: "Wie",
      password: "password"
    }
  end

  def fixture(:updated_user_attrs, _) do
    %{
      email: "some email",
      name: "Alberta Smithers",
      nickname: "TheNewNick",
      class: "6"
    }
  end

  def fixture(:invalid_user_attrs, _) do
    %{
      email: nil,
      name: nil,
      nickname: nil
    }
  end

  def fixture(:registered_user, attrs) do
    usr =
      %User{}
      |> Map.merge(fixture(:valid_user_attrs))
      |> Map.merge(attrs)

    email = Map.get(usr, :email)

    ((email &&
        Repo.one(
          from(u in User, where: u.email == ^email),
          prefix: @prefix
        )) ||
       Repo.insert!(usr, returning: true, prefix: @prefix))
    |> Map.replace(:password, nil)
  end

  def fixture(:valid_eduplace_user_attrs, attrs) do
    %{
      email: "some@email.de",
      name: "Alberta Smith",
      nickname: "TheNick",
      class: "5",
      password: "password",
      hide_full_name: false
    }
    |> Map.merge(attrs)
  end

  def fixture(:registered_eduplace_user, %{eduplaces_id: eduplaces_id} = attrs) do
    usr =
      %User{}
      |> Map.merge(fixture(:valid_eduplace_user_attrs))
      |> Map.merge(attrs)

    if eduplaces_id do
      Repo.one(
        from(u in User, where: u.eduplaces_id == ^eduplaces_id),
        prefix: @prefix
      )
    end || Repo.insert!(usr, returning: true, prefix: @prefix)
  end

  def fixture(:admin_user, _attrs) do
    {:ok, user} =
      User
      |> struct(fixture(:valid_admin_attrs))
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_assoc(:groups, [fixture(:user_group, is_admin_group: true)])
      |> Repo.insert(prefix: @prefix)

    Repo.get(User, user.id, prefix: @prefix)
  end

  def fixture(:valid_file_attrs, attrs) do
    attrs
    |> Enum.into(%{
      file_type: "some_file_type",
      filename: "some_filename",
      filesize: 42,
      mime_type: "some_mime_type"
    })
  end

  def fixture(:valid_directory_attrs, attrs) do
    attrs
    |> Enum.into(%{
      name: "some directory"
    })
  end

  def fixture(:invalid_file_attrs, attrs) do
    attrs
    |> Enum.into(%{
      file_type: nil,
      filename: nil,
      filesize: 0
    })
  end

  def fixture(:file, user) when is_struct(user), do: fixture(:file, {user, []})

  def fixture(:file, {user, attrs}) do
    {:ok, file} =
      File
      |> struct(fixture(:valid_file_attrs, attrs))
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_assoc(:user, user)
      |> Repo.insert(prefix: @prefix)

    Repo.get!(File, file.id, prefix: @prefix)
  end

  def fixture(:real_file, user) when is_struct(user),
    do: fixture(:real_file, {user, []})

  def fixture(:real_file, {user, attrs}) do
    file =
      fixture(:file, {user, attrs})

    {:ok, file_data} = FileData.from_path("test/support/fixtures/secrets.zip")
    path = Enum.join([Repo.get_prefix(), file.id, "original"], "/")
    {:ok, entity_data} = Lotta.Storage.RemoteStorage.create(file_data, path)

    file
    |> Repo.preload(:remote_storage_entity)
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(
      :remote_storage_entity,
      entity_data
    )
    |> Repo.update!()
  end

  def fixture(:real_image_file, user) when is_struct(user),
    do: fixture(:real_image_file, {user, []})

  def fixture(:real_image_file, {user, attrs}) do
    file =
      fixture(:file, {user, Keyword.merge([file_type: "image", mime_type: "image/jpeg"], attrs)})

    {:ok, file_data} = FileData.from_path("test/support/fixtures/image_file.png")
    path = Enum.join([Repo.get_prefix(), file.id, "original"], "/")
    {:ok, entity_data} = Lotta.Storage.RemoteStorage.create(file_data, path)

    file
    |> Repo.preload(:remote_storage_entity)
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(
      :remote_storage_entity,
      entity_data
    )
    |> Repo.update!()
  end

  def fixture(:real_audio_file, user) when is_struct(user),
    do: fixture(:real_audio_file, {user, []})

  def fixture(:real_audio_file, {user, attrs}) do
    file =
      fixture(:file, {user, Keyword.merge([file_type: "audio", mime_type: "audio/mp3"], attrs)})

    {:ok, file_data} = FileData.from_path("test/support/fixtures/eoa2.mp3")
    path = Enum.join([Repo.get_prefix(), file.id, "original"], "/")
    {:ok, entity_data} = Lotta.Storage.RemoteStorage.create(file_data, path)

    file
    |> Repo.preload([:remote_storage_entity, :parent_directory])
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(
      :remote_storage_entity,
      entity_data
    )
    |> Ecto.Changeset.put_assoc(
      :parent_directory,
      %{name: "Audios", parent_directory_id: nil, user_id: user.id}
    )
    |> Repo.update!()
  end

  def fixture(:real_video_file, user) when is_struct(user),
    do: fixture(:real_video_file, {user, []})

  def fixture(:real_video_file, {user, attrs}) do
    file =
      fixture(:file, {user, Keyword.merge([file_type: "video", mime_type: "video/mp4"], attrs)})

    {:ok, file_data} = FileData.from_path("test/support/fixtures/pc3.m4v")
    path = Enum.join([Repo.get_prefix(), file.id, "original"], "/")
    {:ok, entity_data} = Lotta.Storage.RemoteStorage.create(file_data, path)

    file
    |> Repo.preload([:remote_storage_entity, :parent_directory])
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(
      :remote_storage_entity,
      entity_data
    )
    |> Ecto.Changeset.put_assoc(
      :parent_directory,
      %{name: "Videos", parent_directory_id: nil, user_id: user.id}
    )
    |> Repo.update!()
  end

  # Content

  def fixture(:valid_article_attrs, _) do
    %{
      title: "Mein Artikel",
      preview: "Kleine Artikel-Vorschau",
      tags: ["Mein Thema"],
      ready_to_publish: true,
      is_pinned_to_top: false,
      category: fixture(:category)
    }
  end

  def fixture(:article, %User{} = user) do
    %Article{}
    |> Map.merge(fixture(:valid_article_attrs))
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:users, [user])
    |> Repo.insert!(prefix: @prefix)
  end

  def fixture(:unpublished_article, %User{} = user) do
    Article
    |> struct(fixture(:valid_article_attrs))
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:users, [user])
    |> Ecto.Changeset.put_assoc(:category, nil)
    |> Repo.insert!(on_conflict: :nothing, returning: true, prefix: @prefix)
  end

  # Messages

  def fixture(:message_content, _params) do
    "Das ist die Nachricht"
  end

  def fixture(:message, params) do
    %Message{content: fixture(:message_content)}
    |> Map.merge(params)
    |> Repo.insert!(prefix: @prefix)
  end

  def fixture(:create_conversation_users, users) do
    conversation =
      %Conversation{}
      |> Repo.insert!(prefix: @prefix)

    Repo.insert_all(
      "conversation_user",
      Enum.map(
        users,
        &%{conversation_id: UUID.string_to_binary!(conversation.id), user_id: &1.id}
      ),
      prefix: @prefix
    )

    Repo.reload!(conversation)
  end

  def fixture(:create_conversation_groups, groups) do
    conversation =
      %Conversation{}
      |> Repo.insert!(prefix: @prefix)

    Repo.insert_all(
      "conversation_group",
      Enum.map(
        groups,
        &%{conversation_id: UUID.string_to_binary!(conversation.id), user_group_id: &1.id}
      ),
      prefix: @prefix
    )

    Repo.reload!(conversation)
  end
end
