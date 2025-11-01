defmodule Lotta.Tenants.DefaultContent do
  @moduledoc """
  All the data for adding default content to a new instance
  """

  require Logger

  import Ecto.Changeset

  alias Lotta.Tenants
  alias Lotta.{Email, Mailer, Repo, Storage}
  alias Lotta.Tenants.{Category, Tenant}
  alias Lotta.Storage.{Directory, FileData, RemoteStorage}
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Content.{Article, ContentModule}

  @doc """
  Creates the default content for a new tenant.
  The tenant should already have been created, the user should be eligible to be administrator
  """
  @spec create_default_content(Tenant.t(), User.t()) :: :ok | {:error, any()}
  def create_default_content(tenant, admin_user) do
    with {:ok, _default_groups} <- create_default_groups(tenant),
         {:ok, [_homepage, content_category]} <- create_categories(tenant),
         {:ok, files} <- create_files(tenant, admin_user),
         {:ok, _articles} <- create_articles(admin_user, content_category, files),
         {:ok, _mail} <- send_ready_email(tenant, admin_user),
         {:ok, _tenant} <- Tenants.update_state(tenant, :active) do
      sync_external(tenant)

      :ok
    end
  end

  defp create_default_groups(tenant) do
    now = DateTime.utc_now(:second)

    groups = [
      [name: "Lehrer", sort_key: 10, inserted_at: now, updated_at: now],
      [name: "Schüler", sort_key: 20, inserted_at: now, updated_at: now]
    ]

    count = length(groups)

    case Repo.insert_all(UserGroup, groups, prefix: tenant.prefix, returning: true) do
      {^count, groups} -> {:ok, groups}
      _ -> {:error, "Error creating default groups"}
    end
  end

  defp create_categories(tenant) do
    now = DateTime.utc_now(:second)

    categories = [
      [
        title: "Startseite",
        sort_key: 0,
        is_sidenav: false,
        is_homepage: true,
        inserted_at: now,
        updated_at: now
      ],
      [
        title: "Über lotta",
        sort_key: 10,
        is_sidenav: false,
        is_homepage: false,
        inserted_at: now,
        updated_at: now
      ]
    ]

    count = length(categories)

    case Repo.insert_all(
           Category,
           categories,
           prefix: tenant.prefix,
           returning: true
         ) do
      {^count, categories} -> {:ok, categories}
      _ -> {:error, "Error creating categories"}
    end
  end

  defp create_files(tenant, user) do
    with {:ok, shared_dir} <-
           Repo.insert(%Directory{name: "Öffentliche Dateien"}, prefix: tenant.prefix) do
      create_default_files(shared_dir, user)
    end
  end

  defp create_default_files(shared_dir, user) do
    available_assets()
    |> Enum.reduce_while({:ok, []}, fn {filename, type, path}, {:ok, files} ->
      with {:ok, file_data} <- FileData.from_path(path, mime_type: type),
           {:ok, file} <- Storage.create_file(file_data, shared_dir, user, skip_wait: true) do
        {:cont, {:ok, [file | files]}}
      else
        error ->
          Logger.error("Error creating file #{filename}: #{inspect(error)}")
          {:halt, error}
      end
    end)
  end

  defp create_articles(user, content_category, files) do
    context = %{
      user: user,
      content_category: content_category,
      default_files: files,
      prefix: Ecto.get_meta(user, :prefix)
    }

    [
      :create_first_step_1_article_changeset,
      :create_first_step_2_article_changeset,
      :create_welcome_article_changeset
    ]
    |> Enum.reduce_while({:ok, []}, fn fn_name, {:ok, articles} ->
      changeset = apply(__MODULE__, fn_name, [context])

      case Repo.insert(changeset, prefix: context.prefix) do
        {:ok, article} ->
          {:cont, {:ok, [article | articles]}}

        error ->
          Logger.error("Error creating article #{fn_name}: #{inspect(error)}")
          {:halt, error}
      end
    end)
  end

  @doc false
  def create_first_step_1_article_changeset(%{
        user: user,
        content_category: category,
        default_files: files
      }) do
    %Article{
      title: "Erste Schritte mit Lotta",
      is_pinned_to_top: false,
      tags: ["Hilfe"],
      preview: "Erstellen und bearbeiten Sie Kategorien",
      published: true
    }
    |> change()
    |> put_assoc(:category, category)
    |> put_assoc(:preview_image_file, Enum.find(files, &(&1.filename == "kinderleicht1.jpg")))
    |> put_assoc(:users, [user])
    |> put_assoc(:content_modules, [
      %ContentModule{
        type: "title",
        configuration: %{},
        content: %{title: "Einführung"},
        sort_key: 0
      },
      %ContentModule{
        type: "text",
        configuration: %{},
        content: read_json(files, "first-steps-categories-SK10"),
        sort_key: 10
      },
      %ContentModule{
        type: "title",
        configuration: %{},
        content: %{title: "Wie Sie Kategorien anlegen"},
        sort_key: 20
      },
      %ContentModule{
        type: "text",
        configuration: %{},
        content: read_json(files, "first-steps-categories-SK30"),
        sort_key: 30
      },
      %ContentModule{
        type: "text",
        configuration: %{},
        content: read_json(files, "first-steps-categories-SK40"),
        sort_key: 40
      },
      %ContentModule{
        type: "text",
        configuration: %{},
        content: read_json(files, "first-steps-categories-SK50"),
        sort_key: 50
      },
      %ContentModule{
        type: "text",
        configuration: %{},
        content: read_json(files, "first-steps-categories-SK60"),
        sort_key: 60
      },
      %ContentModule{
        type: "text",
        configuration: %{},
        content: read_json(files, "first-steps-categories-SK70"),
        sort_key: 70
      },
      %ContentModule{
        type: "text",
        configuration: %{},
        content: read_json(files, "first-steps-categories-SK80"),
        sort_key: 80
      },
      %ContentModule{
        type: "title",
        configuration: %{},
        content: %{title: "Einstellmöglichkeiten in Kategorien"},
        sort_key: 90
      },
      %ContentModule{
        type: "text",
        configuration: %{},
        content: read_json(files, "first-steps-categories-SK100"),
        sort_key: 100
      }
    ])
  end

  @doc false
  def create_first_step_2_article_changeset(%{
        user: user,
        content_category: category,
        default_files: files
      }) do
    %Article{
      title: "Erste Schritte mit Lotta",
      is_pinned_to_top: false,
      tags: ["Hilfe"],
      preview: "Nutzergruppen & Einschreibeschlüssel organisieren",
      published: true
    }
    |> change()
    |> put_assoc(:category, category)
    |> put_assoc(:preview_image_file, Enum.find(files, &(&1.filename == "kinderleicht2.jpg")))
    |> put_assoc(:users, [user])
    |> put_assoc(:content_modules, [
      %ContentModule{
        type: "text",
        configuration: %{},
        content: read_json(files, "first-steps-usergroups-SK0"),
        sort_key: 0
      },
      %ContentModule{
        type: "image",
        configuration: %{},
        content: %{caption: "Bild 1"},
        files: [Enum.find(files, &(&1.filename == "erste-schritte-gruppen-anlegen-s1.png"))],
        sort_key: 10
      },
      %ContentModule{
        type: "text",
        configuration: %{},
        content: read_json(files, "first-steps-usergroups-SK20"),
        sort_key: 20
      },
      %ContentModule{
        type: "image",
        configuration: %{},
        content: %{
          caption: "Bild 2: Eintragen von Einschreibeschlüssel im persönlichen Profil der Nutzer."
        },
        files: [Enum.find(files, &(&1.filename == "erste-schritte-gruppen-anlegen-s2.png"))],
        sort_key: 30
      },
      %ContentModule{
        type: "text",
        configuration: %{},
        content: read_json(files, "first-steps-usergroups-SK40"),
        sort_key: 40
      },
      %ContentModule{
        type: "image_collection",
        configuration: %{
          "files" => %{
            Enum.find(files, &(&1.filename == "homepage-oeffentlich.jpg")).id => %{
              "caption" => "",
              "sortKey" => 0
            },
            Enum.find(files, &(&1.filename == "homepage-schueler.jpg")).id => %{
              "caption" => "",
              "sortKey" => 10
            },
            Enum.find(files, &(&1.filename == "homepage-lehrer.jpg")).id => %{
              "caption" => "",
              "sortKey" => 20
            }
          },
          "imageStyle" => 2,
          "sorting" => 0
        },
        content: %{},
        files: [
          Enum.find(files, &(&1.filename == "homepage-oeffentlich.jpg")),
          Enum.find(files, &(&1.filename == "homepage-schueler.jpg")),
          Enum.find(files, &(&1.filename == "homepage-lehrer.jpg"))
        ],
        sort_key: 50
      },
      %ContentModule{
        type: "text",
        configuration: %{},
        content: read_json(files, "first-steps-usergroups-SK60"),
        sort_key: 60
      },
      %ContentModule{
        type: "download",
        configuration: %{
          Enum.find(files, &(&1.filename == "erste-schritte-nutzergruppen.pdf")).id => %{
            description: "Diesen Beitrag als PDF-Datei herunterladen.",
            sortKey: 0
          }
        },
        content: %{},
        files: [Enum.find(files, &(&1.filename == "erste-schritte-nutzergruppen.pdf"))],
        sort_key: 70
      }
    ])
  end

  @doc false
  def create_welcome_article_changeset(%{
        user: user,
        content_category: category,
        default_files: files
      }) do
    %Article{
      title: "Willkommen",
      is_pinned_to_top: true,
      tags: ["Hilfe"],
      preview: "Ihre ersten Schritte mit Lotta",
      published: true
    }
    |> change()
    |> put_assoc(:category, category)
    |> put_assoc(
      :preview_image_file,
      Enum.find(files, &(&1.filename == "willkommen-bei-lotta.png"))
    )
    |> put_assoc(:users, [user])
    |> put_assoc(:content_modules, [
      %ContentModule{
        type: "text",
        configuration: %{},
        sort_key: 0,
        content: read_json(files, "welcome")
      }
    ])
  end

  defp send_ready_email(_tenant, %{email: nil}), do: {:ok, nil}

  defp send_ready_email(tenant, user) do
    user
    |> Email.lotta_ready_mail(tenant: tenant)
    |> Mailer.deliver_later()
  end

  defp sync_external(%{eduplaces_id: eduplaces_id} = tenant)
       when is_binary(eduplaces_id) and byte_size(eduplaces_id) > 0 do
    task =
      Task.Supervisor.async_nolink(Lotta.TaskSupervisor, fn ->
        Lotta.Eduplaces.Syncer.sync_tenant_groups(tenant)
      end)

    case Task.yield(task, :timer.minutes(5)) || Task.shutdown(task) do
      {:ok, result} ->
        result

      nil ->
        Logger.warning("External sync timed out for tenant #{tenant.slug}")
        :ok

      {:exit, reason} ->
        Logger.warning("External sync failed for tenant #{tenant.slug}: #{inspect(reason)}")
        :ok
    end
  end

  defp sync_external(_tenant), do: :ok

  defp available_assets() do
    [
      {"willkommen-bei-lotta.png", "image/png"},
      {"kinderleicht1.jpg", "image/jpg"},
      {"kinderleicht2.jpg", "image/jpg"},
      {"willkommen-persoenliches-menu.jpg", "image/jpg"},
      {"willkommen-admin-nav.png", "image/png"},
      {"kategorien-anlegen-s1.jpg", "image/jpg"},
      {"kategorien-anlegen-s2.jpg", "image/jpg"},
      {"kategorien-anlegen-s3.jpg", "image/jpg"},
      {"kategorien-anlegen-s4.jpg", "image/jpg"},
      {"kategorien-anlegen-s5.jpg", "image/jpg"},
      {"kategorien-anlegen-s6.jpg", "image/jpg"},
      {"homepage-oeffentlich.jpg", "image/jpg"},
      {"homepage-schueler.jpg", "image/jpg"},
      {"homepage-lehrer.jpg", "image/jpg"},
      {"erste-schritte-gruppen-anlegen-s1.png", "image/png"},
      {"erste-schritte-gruppen-anlegen-s2.png", "image/png"},
      {"erste-schritte-nutzergruppen.pdf", "application/pdf"}
    ]
    |> Enum.map(fn {filename, type} ->
      path = Application.app_dir(:lotta, "priv/default_content/files/#{filename}")
      {filename, type, path}
    end)
  end

  defp read_json(files, filename) do
    Application.app_dir(:lotta, "priv/default_content/text/#{filename}.json")
    |> File.read!()
    |> String.replace(~r/__REMOTE_URL____([\w\-.]*)/, fn text ->
      filename = String.replace_leading(text, "__REMOTE_URL____", "")

      case Enum.find(files, &(&1.filename == filename)) do
        file when not is_nil(file) ->
          file
          |> Repo.preload(:remote_storage_entity)
          |> Map.fetch!(:remote_storage_entity)
          |> RemoteStorage.get_http_url()

        _ ->
          text
      end
    end)
    |> Poison.decode!()
  end
end
