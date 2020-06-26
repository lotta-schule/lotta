defmodule Api.Tenants.DefaultContent do
  @moduledoc """
  All the data for adding default content to a new tenant
  """

  import Ecto.Changeset
  alias Api.Repo
  alias Api.Accounts
  alias Api.Accounts.{Directory, User}
  alias Api.UploadService
  alias Api.Tenants.{Category, Tenant}
  alias Api.Content.{Article, ContentModule}

  alias __MODULE__.Context, as: Ctx

  defmodule __MODULE__.Context do
    defstruct tenant: %Tenant{},
              user: %User{},
              files: [],
              public_directory: nil,
              admin_group: nil,
              home_category: nil,
              content_category: nil
  end

  def create_default_content!(tenant, user) do
    %Ctx{tenant: tenant, user: user}
    |> create_default_groups!()
    |> create_default_categories!()
    |> create_default_files!()
    |> create_default_articles!()
  end

  defp create_default_groups!(%Ctx{tenant: tenant, user: user} = ctx) do
    admin_group =
      tenant
      |> Ecto.build_assoc(:groups, %{
        name: "Administrator",
        sort_key: 0,
        is_admin_group: true
      })
      |> Repo.insert!()

    Accounts.set_user_groups(user, tenant, [admin_group])

    ["Lehrer", "Schüler"]
    |> Enum.with_index()
    |> Enum.each(fn {name, i} ->
      tenant
      |> Ecto.build_assoc(:groups, %{
        name: name,
        sort_key: 10 + i * 10,
        tenant_id: tenant.id
      })
      |> Repo.insert!()
    end)

    ctx
    |> Map.put(:admin_group, admin_group)
  end

  defp create_default_categories!(%Ctx{tenant: tenant} = ctx) do
    home_category =
      tenant
      |> Ecto.build_assoc(:categories, %{
        title: "Startseite",
        sort_key: 0,
        is_sidenav: false,
        is_homepage: true
      })
      |> Repo.insert!()

    content_category =
      tenant
      |> Ecto.build_assoc(:categories, %{
        title: "Erste Schritte",
        sort_key: 10,
        is_sidenav: false,
        is_homepage: false
      })
      |> Repo.insert!()

    ctx
    |> Map.put(:home_category, home_category)
    |> Map.put(:content_category, content_category)
  end

  defp create_default_files!(%Ctx{tenant: tenant, user: %User{id: user_id}} = ctx) do
    shared_dir =
      %Directory{
        tenant_id: tenant.id,
        name: "Öffentliche Dateien"
      }
      |> Repo.insert!()

    files =
      available_assets()
      |> Enum.with_index()
      |> Enum.map(fn {{filename, type}, index} ->
        oid = "#{user_id}#{DateTime.to_unix(DateTime.utc_now())}#{index}#{:rand.uniform(9999)}"
        fullpath = "priv/default_content/files/#{filename}"
        %{size: filesize} = File.stat!(fullpath)

        %{url: remote_location} =
          UploadService.upload_to_space(%{
            localfilepath: fullpath,
            content_type: type,
            file_name: UUID.uuid5(:dns, "#{oid}.ugc.lotta.schule")
          })

        {:ok, file} =
          Accounts.create_file(%{
            user_id: user_id,
            tenant_id: tenant.id,
            parent_directory_id: shared_dir.id,
            remote_location: remote_location,
            filename: filename,
            filesize: filesize,
            file_type:
              case type do
                "image" <> _ -> "image"
                "application/pdf" -> "pdf"
              end,
            mime_type: type
          })

        file
      end)

    ctx
    |> Map.put(:public_directory, shared_dir)
    |> Map.put(:files, files)
  end

  defp create_default_articles!(
         %Ctx{tenant: tenant, user: user, content_category: category, files: files} = ctx
       ) do
    first_steps_1 =
      %Article{
        title: "Erste Schritte mit Lotta",
        is_pinned_to_top: false,
        topic: "Hilfe",
        preview: "Erstellen und bearbeiten Sie Kategorien"
      }
      |> change()
      |> put_assoc(:tenant, tenant)
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
          content: read_json(ctx, "first-steps-categories-SK10"),
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
          content: read_json(ctx, "first-steps-categories-SK30"),
          sort_key: 30
        },
        %ContentModule{
          type: "text",
          configuration: %{},
          content: read_json(ctx, "first-steps-categories-SK40"),
          sort_key: 40
        },
        %ContentModule{
          type: "text",
          configuration: %{},
          content: read_json(ctx, "first-steps-categories-SK50"),
          sort_key: 50
        },
        %ContentModule{
          type: "text",
          configuration: %{},
          content: read_json(ctx, "first-steps-categories-SK60"),
          sort_key: 60
        },
        %ContentModule{
          type: "text",
          configuration: %{},
          content: read_json(ctx, "first-steps-categories-SK70"),
          sort_key: 70
        },
        %ContentModule{
          type: "text",
          configuration: %{},
          content: read_json(ctx, "first-steps-categories-SK80"),
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
          content: read_json(ctx, "first-steps-categories-SK100"),
          sort_key: 100
        }
      ])
      |> Repo.insert!()

    first_steps_2 =
      %Article{
        title: "Erste Schritte mit Lotta",
        is_pinned_to_top: false,
        topic: "Hilfe",
        preview: "Nutzergruppen & Einschreibeschlüssel organisieren"
      }
      |> change()
      |> put_assoc(:tenant, tenant)
      |> put_assoc(:category, category)
      |> put_assoc(:preview_image_file, Enum.find(files, &(&1.filename == "kinderleicht2.jpg")))
      |> put_assoc(:users, [user])
      |> put_assoc(:content_modules, [
        %ContentModule{
          type: "text",
          configuration: %{},
          content: read_json(ctx, "first-steps-usergroups-SK0"),
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
          content: read_json(ctx, "first-steps-usergroups-SK20"),
          sort_key: 20
        },
        %ContentModule{
          type: "image",
          configuration: %{},
          content: %{
            caption:
              "Bild 2: Eintragen von Einschreibeschlüssel im persönlichen Profil der Nutzer."
          },
          files: [Enum.find(files, &(&1.filename == "erste-schritte-gruppen-anlegen-s2.png"))],
          sort_key: 30
        },
        %ContentModule{
          type: "text",
          configuration: %{},
          content: read_json(ctx, "first-steps-usergroups-SK40"),
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
          content: read_json(ctx, "first-steps-usergroups-SK60"),
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
      |> Repo.insert!()

    welcome_page =
      %Article{
        title: "Willkommen",
        is_pinned_to_top: true,
        topic: "Hilfe",
        preview: "Ihre ersten Schritte in Lotta"
      }
      |> change()
      |> put_assoc(:tenant, tenant)
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
          content: read_json(ctx, "welcome")
        }
      ])
      |> Repo.insert!()

    ctx
    |> Map.put(:articles, [welcome_page, first_steps_1, first_steps_2])
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

  defp read_json(%Ctx{files: files}, filename) do
    Application.app_dir(:api, "priv/default_content/text/#{filename}.json")
    |> File.read!()
    |> String.replace(~r/__REMOTE_URL____([[:word:]-\.]*)/, fn text ->
      filename = String.replace_leading(text, "__REMOTE_URL____", "")

      case Enum.find(files, &(&1.filename == filename)) do
        file when not is_nil(file) ->
          file.remote_location

        _ ->
          text
      end
    end)
    |> Poison.decode!()
  end
end
