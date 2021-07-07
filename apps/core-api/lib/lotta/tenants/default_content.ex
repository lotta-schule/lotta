defmodule Lotta.Tenants.DefaultContent do
  @moduledoc """
  All the data for adding default content to a new instance
  """

  require Logger

  import Ecto.Changeset

  alias Ecto.Multi
  alias Lotta.{Accounts, Email, Mailer, Repo, Storage}
  alias Lotta.Tenants.Category
  alias Lotta.Storage.{Directory, RemoteStorage}
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Content.{Article, ContentModule}

  @doc """
  Creates the default content for a new tenant.
  The tenant should already have been created, the user should be eligible to be administrator
  """
  @spec create_default_content(map()) :: Multi.t()
  def create_default_content(%{tenant: tenant, user_params: user_params}) do
    opts = [prefix: tenant.prefix]

    Multi.new()
    |> Multi.put(:stage2_locals, %{tenant: tenant, user_params: user_params})
    |> Multi.run(:user, &create_admin_user/2)
    |> Multi.insert(:admin_group, &create_admin_group/1, opts)
    |> Multi.update(:assigned_admin_group, &assign_admin_group/1, opts)
    |> Multi.append(create_default_groups_multi(opts))
    |> Multi.insert(:homepage_category, &create_homepage_category_changeset/1, opts)
    |> Multi.insert(:content_category, &create_content_category_changeset/1, opts)
    |> Multi.insert(:shared_dir, &create_shared_dir/1, opts)
    |> Multi.run(:default_files, &create_default_files/2)
    |> Multi.insert(:first_step_1_article, &create_first_step_1_article_changeset/1, opts)
    |> Multi.insert(:first_step_2_article, &create_first_step_2_article_changeset/1, opts)
    |> Multi.insert(:welcome_article, &create_welcome_article_changeset/1, opts)
    |> Multi.run(:confirmation_mail, &send_ready_email/2)
    |> Multi.run(:put_elasticsearch_docs, &put_elasticsearch_docs/2)
  end

  defp create_admin_user(_repo, %{stage2_locals: %{tenant: tenant, user_params: user_params}}) do
    case Accounts.register_user(tenant, user_params) do
      {:ok, user, password} ->
        {:ok, Map.put(user, :password, password)}

      error ->
        error
    end
  end

  defp create_admin_group(%{stage2_locals: %{tenant: tenant}}) do
    %UserGroup{
      name: "Administrator",
      sort_key: 0,
      is_admin_group: true
    }
    |> Ecto.put_meta(prefix: tenant.prefix)
  end

  defp assign_admin_group(%{user: user, admin_group: group}) do
    User.update_changeset(user, %{groups: [group]})
  end

  defp create_default_groups_multi(opts) do
    ["Lehrer", "Schüler"]
    |> Enum.with_index()
    |> Enum.reduce(Multi.new(), fn {name, i}, multi ->
      Multi.insert(
        multi,
        String.downcase(name) <> "_group",
        %UserGroup{
          name: name,
          sort_key: 10 + i * 10
        },
        opts
      )
    end)
  end

  defp create_homepage_category_changeset(_changes) do
    %Category{
      title: "Startseite",
      sort_key: 0,
      is_sidenav: false,
      is_homepage: true
    }
  end

  defp create_content_category_changeset(_changes) do
    %Category{
      title: "Über lotta",
      sort_key: 10,
      is_sidenav: false,
      is_homepage: false
    }
  end

  defp create_shared_dir(%{stage2_locals: %{tenant: tenant}}) do
    Ecto.put_meta(%Directory{name: "Öffentliche Dateien"}, prefix: tenant.prefix)
  end

  defp create_default_files(_repo, %{user: user, shared_dir: dir}) do
    {:ok,
     available_assets()
     |> Enum.with_index()
     |> Enum.map(fn {{filename, type}, _index} ->
       fullpath = Application.app_dir(:lotta, "priv/default_content/files/#{filename}")

       {:ok, file} =
         Storage.create_stored_file_from_upload(
           %Plug.Upload{
             path: fullpath,
             content_type: type,
             filename: filename
           },
           dir,
           user
         )

       file
     end)}
  end

  defp create_first_step_1_article_changeset(%{
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

  defp create_first_step_2_article_changeset(%{
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

  defp create_welcome_article_changeset(%{
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

  defp send_ready_email(_repo, %{stage2_locals: %{tenant: tenant}, user: user}) do
    user
    |> Email.lotta_ready_mail(tenant: tenant)
    |> Mailer.deliver_later()
  end

  defp put_elasticsearch_docs(_repo, %{
         first_step_1_article: a1,
         first_step_2_article: a2,
         welcome_article: a3
       }) do
    Enum.each([a1, a2, a3], fn article ->
      Elasticsearch.put_document(Lotta.Elasticsearch.Cluster, article, "articles")
    end)

    {:ok, true}
  end

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
  end

  defp read_json(files, filename) do
    Application.app_dir(:lotta, "priv/default_content/text/#{filename}.json")
    |> File.read!()
    |> String.replace(~r/__REMOTE_URL____([[:word:]-\.]*)/, fn text ->
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
