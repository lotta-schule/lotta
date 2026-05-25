defmodule Lotta.Repo.Seeder do
  alias Ecto.Changeset
  alias Lotta.{Accounts, Tenants, Repo}
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Content.{Article, ContentModule}
  alias Lotta.Tenants.{Category, Tenant, TenantDbManager}

  def seed do
    # Repo.insert!(%CustomDomain{host: "lotta.web", is_main_domain: true})
    Lotta.Storage.FileData.create_cache_dir()

    prefix = "tenant_test"

    tenant =
      Repo.insert!(%Tenant{
        title: "Test Lotta",
        slug: "test",
        prefix: prefix,
        configuration: %{
          custom_theme: %{
            "palette" => %{
              "primary" => %{"main" => "red"},
              "secondary" => %{"main" => "green"}
            }
          }
        }
      })

    {:ok, _} = TenantDbManager.create_tenant_database_schema(tenant)

    Repo.put_prefix(prefix)

    admin_group =
      Repo.insert!(
        %UserGroup{
          name: "Administration",
          is_admin_group: true,
          sort_key: 1000
        },
        prefix: prefix
      )

    verwaltung_group =
      Repo.insert!(%UserGroup{name: "Verwaltung", sort_key: 800}, prefix: tenant.prefix)

    lehrer_group =
      Repo.insert!(
        %UserGroup{
          name: "Lehrer",
          sort_key: 600,
          can_read_full_name: true,
          enrollment_tokens: ["LEb0815Hp!1969"]
        },
        prefix: tenant.prefix
      )

    schueler_group =
      Repo.insert!(
        %UserGroup{name: "Schüler", sort_key: 400, enrollment_tokens: ["Seb034hP2?019"]},
        prefix: tenant.prefix
      )

    {:ok, lotta_admin} =
      Accounts.register_user_by_mail(tenant, %{
        name: "Alexis Rinaldoni",
        email: "alexis.rinaldoni@einsa.net",
        password: "password"
      })

    lotta_admin
    |> User.update_password_changeset("password")
    |> Repo.update!()

    {:ok, alexis} =
      Accounts.register_user_by_mail(tenant, %{
        name: "Alexis Rinaldoni",
        nickname: "Der Meister",
        email: "alexis.rinaldoni@lotta.schule"
      })

    alexis
    |> User.update_password_changeset("password")
    |> Repo.update!()

    {:ok, billy} =
      Accounts.register_user_by_mail(tenant, %{
        name: "Christopher Bill",
        nickname: "Billy",
        email: "billy@lotta.schule",
        password: "password",
        enrollment_tokens: ["Seb034hP2?019"]
      })

    billy
    |> User.update_password_changeset("password")
    |> Repo.update!()

    {:ok, eike} =
      Accounts.register_user_by_mail(tenant, %{
        name: "Eike Wiewiorra",
        nickname: "Chef",
        email: "eike.wiewiorra@lotta.schule"
      })

    eike
    |> User.update_password_changeset("password")
    |> Repo.update!()

    {:ok, dr_evil} =
      Accounts.register_user_by_mail(tenant, %{
        name: "Dr Evil",
        nickname: "drEvil",
        email: "drevil@lotta.schule"
      })

    dr_evil_password = Map.get(dr_evil, :password)

    dr_evil
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_change(:password_hash, Argon2.hash_pwd_salt("password"))
    |> Ecto.Changeset.put_change(:password_hash_format, 1)
    |> Ecto.Changeset.put_change(:has_changed_default_password, false)
    |> Repo.update!()

    dr_evil = Map.put(dr_evil, :password, dr_evil_password)

    Accounts.register_user_by_mail(tenant, %{
      name: "Max Mustermann",
      nickname: "MaXi",
      email: "maxi@lotta.schule",
      password: "password"
    })

    Accounts.register_user_by_mail(tenant, %{
      name: "Dorothea Musterfrau",
      nickname: "Doro",
      email: "doro@lotta.schule",
      password: "password"
    })

    Accounts.register_user_by_mail(tenant, %{
      name: "Marie Curie",
      nickname: "Polonium",
      email: "mcurie@lotta.schule",
      hide_full_name: true,
      password: "password"
    })

    Tenants.create_feedback(eike, %{
      topic: "Test",
      content: "Hallo, ich bin ein Test",
      metadata: "Test"
    })

    Tenants.create_feedback(eike, %{
      topic: "Test",
      content: "Hallo, ich bin ein zweiter Test",
      metadata: "Test"
    })

    Tenants.create_feedback(dr_evil, %{
      topic: "Anfrage",
      content: "Weil ich böse bin, will ich auch einen Account mit Admin-Rechten",
      metadata: "Test"
    })

    {:ok, alexis} = Accounts.update_user(alexis, %{groups: [admin_group]})
    {:ok, eike} = Accounts.update_user(eike, %{groups: [lehrer_group]})

    _homepage = Repo.insert!(%Category{title: "Start", is_homepage: true}, prefix: tenant.prefix)

    profil =
      Repo.insert!(
        %Category{
          sort_key: 10,
          title: "Profil"
        },
        prefix: tenant.prefix
      )

    gta =
      Repo.insert!(
        %Category{
          sort_key: 20,
          title: "GTA"
        },
        prefix: tenant.prefix
      )

    projekt =
      Repo.insert!(
        %Category{
          sort_key: 30,
          title: "Projekt"
        },
        prefix: tenant.prefix
      )

    faecher =
      Repo.insert!(
        %Category{
          sort_key: 40,
          title: "Fächer"
        },
        prefix: tenant.prefix
      )

    material = Repo.insert!(%Category{sort_key: 50, title: "Material"}, prefix: tenant.prefix)
    Repo.insert!(%Category{sort_key: 60, title: "Galerien"}, prefix: tenant.prefix)

    Repo.insert!(
      %Category{
        sort_key: 70,
        title: "Impressum",
        is_sidenav: true
      },
      prefix: tenant.prefix
    )

    assign_groups(profil, [verwaltung_group])
    assign_groups(gta, [verwaltung_group, lehrer_group, schueler_group])
    assign_groups(faecher, [verwaltung_group, lehrer_group, schueler_group])
    assign_groups(material, [verwaltung_group, lehrer_group])

    # Fächer
    Repo.insert!(
      %Category{
        sort_key: 10,
        title: "Sport",
        category_id: faecher.id
      },
      prefix: tenant.prefix
    )

    Repo.insert!(
      %Category{
        sort_key: 20,
        title: "Kunst",
        category_id: faecher.id
      },
      prefix: tenant.prefix
    )

    Repo.insert!(
      %Category{
        sort_key: 30,
        title: "Sprache",
        category_id: faecher.id
      },
      prefix: tenant.prefix
    )
    |> assign_groups([verwaltung_group, lehrer_group])

    # Profil
    Repo.insert!(
      %Category{
        sort_key: 10,
        title: "Podcast",
        category_id: profil.id
      },
      prefix: tenant.prefix
    )

    Repo.insert!(
      %Category{
        sort_key: 20,
        title: "Offene Kunst-AG",
        category_id: profil.id
      },
      prefix: tenant.prefix
    )

    Repo.insert!(
      %Category{
        sort_key: 30,
        title: "Schülerzeitung",
        category_id: profil.id
      },
      prefix: tenant.prefix
    )

    Repo.insert!(
      %Category{
        sort_key: 40,
        title: "Oskar-Reime-Chor",
        category_id: profil.id
      },
      prefix: tenant.prefix
    )

    Repo.insert!(
      %Category{
        sort_key: 50,
        title: "Schüler-Radio",
        category_id: profil.id
      },
      prefix: tenant.prefix
    )

    # Articles

    Repo.insert!(
      %Article{
        title: "Draft1",
        preview: "Entwurf Artikel zu I",
        inserted_at: ~U[2019-09-01 10:00:00Z],
        updated_at: ~U[2019-09-01 10:00:00Z]
      },
      prefix: tenant.prefix
    )
    |> Repo.preload(:users)
    |> Changeset.change()
    |> Changeset.put_assoc(:users, [eike])
    |> Repo.update!(prefix: tenant.prefix)

    Repo.insert!(
      %Article{
        title: "Draft2",
        preview: "Entwurf Artikel zu XYZ",
        inserted_at: ~U[2019-09-01 10:05:00Z],
        updated_at: ~U[2019-09-01 10:05:00Z]
      },
      prefix: tenant.prefix
    )
    |> Repo.preload(:users)
    |> Changeset.change()
    |> Changeset.put_assoc(:users, [eike])
    |> Repo.update!(prefix: tenant.prefix)

    Repo.insert!(
      %Article{
        title: "Fertiger Artikel zum Konzert",
        preview: "Entwurf Artikel zu XYZ",
        ready_to_publish: true,
        inserted_at: ~U[2019-09-01 10:06:00Z],
        updated_at: ~U[2019-09-01 10:06:00Z]
      },
      prefix: tenant.prefix
    )
    |> Repo.preload(:users)
    |> Changeset.change()
    |> Changeset.put_assoc(:users, [eike])
    |> Repo.update!(prefix: tenant.prefix)

    oskar_goes_to =
      Repo.insert!(
        %Article{
          category_id: profil.id,
          published: true,
          title: "And the oskar goes to ...",
          preview: "Hallo hallo hallo",
          inserted_at: ~U[2019-09-01 10:08:00Z],
          updated_at: ~U[2019-09-01 10:08:00Z]
        },
        prefix: tenant.prefix
      )

    oskar_goes_to
    |> Repo.preload(:users)
    |> Changeset.change()
    |> Changeset.put_assoc(:users, [eike])
    |> Repo.update!(prefix: tenant.prefix)

    Repo.insert!(
      %ContentModule{
        article_id: oskar_goes_to.id,
        type: "text",
        content: %{
          "object" => "value",
          "document" => %{
            "object" => "document",
            "data" => %{},
            "nodes" => [
              %{
                "object" => "block",
                "type" => "paragraph",
                "data" => %{},
                "nodes" => [
                  %{
                    "object" => "text",
                    "text" =>
                      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
                    "marks" => []
                  }
                ]
              }
            ]
          }
        }
      },
      prefix: tenant.prefix
    )

    Repo.insert!(
      %ContentModule{
        article_id: oskar_goes_to.id,
        type: "text",
        content: %{
          "object" => "value",
          "document" => %{
            "object" => "document",
            "data" => %{},
            "nodes" => [
              %{
                "object" => "block",
                "type" => "paragraph",
                "data" => %{},
                "nodes" => [
                  %{
                    "object" => "text",
                    "text" =>
                      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
                    "marks" => []
                  }
                ]
              }
            ]
          }
        }
      },
      prefix: tenant.prefix
    )

    form =
      Repo.insert!(
        %ContentModule{
          article_id: oskar_goes_to.id,
          type: "text",
          content: %{"value" => "Pizza Test-Formular"},
          configuration: %{
            "destination" => "alexis.rinaldoni@lotta.schule",
            "save_internally" => true,
            "elements" => [
              %{
                "descriptionText" => "Halli, hallo, wir sind da, du bist hier, dadub dadumm.",
                "element" => "input",
                "label" => "Name",
                "name" => "name",
                "required" => true,
                "type" => "text"
              },
              %{
                "descriptionText" =>
                  "Falls du ein Gutschein hast, fotografier ihn und füge ihn hier an.",
                "element" => "file",
                "label" => "Coupon",
                "name" => "coupon",
                "required" => true,
                "maxSize" => 1024 * 1024
              },
              %{
                "descriptionText" => "",
                "element" => "selection",
                "label" => "PizzaGröße",
                "name" => "größe",
                "required" => true,
                "type" => "radio",
                "options" => [
                  %{
                    "label" => "klein (22cm Durchmesser)",
                    "selected" => true,
                    "value" => "klein"
                  },
                  %{"label" => "groß (28cm Durchmesser)", "selected" => false, "value" => "groß"},
                  %{
                    "label" => "Familienpizza (50x60cm)",
                    "selected" => false,
                    "value" => "familie"
                  }
                ]
              },
              %{
                "descriptionText" => "",
                "element" => "selection",
                "label" => "Zutat",
                "name" => "feld3",
                "required" => true,
                "type" => "checkbox",
                "options" => [
                  %{
                    "label" => "zusätzliche Peperoni",
                    "selected" => false,
                    "value" => "peperoni"
                  },
                  %{"label" => "Zusätzlicher Käse", "selected" => true, "value" => "käse"},
                  %{"label" => "Pilze", "selected" => true, "value" => "pilze"},
                  %{"label" => "Gorgonzola", "value" => "gorgonzola"},
                  %{"label" => "Ananas (Bestellung wird sofort verworfen)", "value" => "ananas"}
                ]
              },
              %{
                "descriptionText" => "",
                "element" => "selection",
                "label" => "Bei Abholung 10% Rabat",
                "name" => "transport",
                "required" => true,
                "type" => "select",
                "options" => [
                  %{"label" => "Abholung", "selected" => false, "value" => "abholung"},
                  %{"label" => "Lieferung", "selected" => true, "value" => "lieferung"}
                ]
              },
              %{
                "element" => "input",
                "label" => "Weitere Informationen",
                "multiline" => true,
                "name" => "beschreibung",
                "type" => "text"
              }
            ]
          }
        },
        prefix: tenant.prefix
      )

    form
    |> Ecto.build_assoc(:results,
      result: %{
        "responses" => %{
          "beschreibung" => "",
          "feld3" => ["käse", "pilze"],
          "größe" => "klein",
          "name" => "Test",
          "transport" => "lieferung"
        }
      }
    )
    |> Repo.insert!(prefix: tenant.prefix)

    landesfinale =
      Repo.insert!(
        %Article{
          category_id: profil.id,
          title: "Landesfinale Volleyball WK IV",
          preview:
            "Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale \"Jugend trainiert für Europa\" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...",
          inserted_at: ~U[2019-09-01 10:09:00Z],
          updated_at: ~U[2019-09-01 10:09:00Z],
          published: true
        },
        prefix: tenant.prefix
      )

    Repo.insert!(
      %ContentModule{
        article_id: landesfinale.id,
        type: "text",
        content: %{
          "object" => "value",
          "document" => %{
            "object" => "document",
            "data" => %{},
            "nodes" => [
              %{
                "object" => "block",
                "type" => "paragraph",
                "data" => %{},
                "nodes" => [
                  %{
                    "object" => "text",
                    "text" =>
                      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
                    "marks" => []
                  }
                ]
              }
            ]
          }
        }
      },
      prefix: tenant.prefix
    )

    Repo.insert!(
      %ContentModule{
        article_id: landesfinale.id,
        type: "text",
        content: %{
          "object" => "value",
          "document" => %{
            "object" => "document",
            "data" => %{},
            "nodes" => [
              %{
                "object" => "block",
                "type" => "paragraph",
                "data" => %{},
                "nodes" => [
                  %{
                    "object" => "text",
                    "text" =>
                      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
                    "marks" => []
                  }
                ]
              }
            ]
          }
        }
      },
      prefix: tenant.prefix
    )

    kleinkunst_wb2 =
      Repo.insert!(
        %Article{
          category_id: profil.id,
          title: "Der Podcast zum WB 2",
          preview:
            "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.",
          tags: ["KleinKunst 2018"],
          published: true,
          inserted_at: ~U[2019-09-01 10:11:00Z],
          updated_at: ~U[2019-09-01 10:11:00Z]
        },
        prefix: tenant.prefix
      )

    assign_groups(kleinkunst_wb2, [verwaltung_group, lehrer_group, schueler_group])

    Repo.insert!(
      %ContentModule{
        article_id: kleinkunst_wb2.id,
        type: "text",
        content: %{
          "object" => "value",
          "document" => %{
            "object" => "document",
            "data" => %{},
            "nodes" => [
              %{
                "object" => "block",
                "type" => "paragraph",
                "data" => %{},
                "nodes" => [
                  %{
                    "object" => "text",
                    "text" =>
                      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
                    "marks" => []
                  }
                ]
              }
            ]
          }
        }
      },
      prefix: tenant.prefix
    )

    Repo.insert!(
      %ContentModule{
        article_id: kleinkunst_wb2.id,
        type: "text",
        content: %{
          "object" => "value",
          "document" => %{
            "object" => "document",
            "data" => %{},
            "nodes" => [
              %{
                "object" => "block",
                "type" => "paragraph",
                "data" => %{},
                "nodes" => [
                  %{
                    "object" => "text",
                    "text" =>
                      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
                    "marks" => []
                  }
                ]
              }
            ]
          }
        }
      },
      prefix: tenant.prefix
    )

    vorausscheid =
      Repo.insert!(
        %Article{
          category_id: profil.id,
          title: "Der Vorausscheid",
          preview:
            "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.",
          tags: ["KleinKunst 2018"],
          published: true,
          inserted_at: ~U[2019-09-01 10:12:00Z],
          updated_at: ~U[2019-09-01 10:12:00Z]
        },
        prefix: tenant.prefix
      )

    assign_groups(vorausscheid, [verwaltung_group, lehrer_group])

    Repo.insert!(
      %ContentModule{
        article_id: vorausscheid.id,
        type: "text",
        content: %{
          "object" => "value",
          "document" => %{
            "object" => "document",
            "data" => %{},
            "nodes" => [
              %{
                "object" => "block",
                "type" => "paragraph",
                "data" => %{},
                "nodes" => [
                  %{
                    "object" => "text",
                    "text" =>
                      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
                    "marks" => []
                  }
                ]
              }
            ]
          }
        }
      },
      prefix: tenant.prefix
    )

    Repo.insert!(
      %ContentModule{
        article_id: vorausscheid.id,
        type: "text",
        content: %{
          "object" => "value",
          "document" => %{
            "object" => "document",
            "data" => %{},
            "nodes" => [
              %{
                "object" => "block",
                "type" => "paragraph",
                "data" => %{},
                "nodes" => [
                  %{
                    "object" => "text",
                    "text" =>
                      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
                    "marks" => []
                  }
                ]
              }
            ]
          }
        }
      },
      prefix: tenant.prefix
    )

    nipplejesus =
      Repo.insert!(
        %Article{
          category_id: projekt.id,
          title: "„Nipple Jesus“- eine extreme Erfahrung",
          preview:
            "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.",
          published: true,
          inserted_at: ~U[2019-09-01 10:13:00Z],
          updated_at: ~U[2019-09-01 10:13:00Z]
        },
        prefix: tenant.prefix
      )

    Repo.insert!(
      %ContentModule{
        article_id: nipplejesus.id,
        type: "text",
        content: %{
          "object" => "value",
          "document" => %{
            "object" => "document",
            "data" => %{},
            "nodes" => [
              %{
                "object" => "block",
                "type" => "paragraph",
                "data" => %{},
                "nodes" => [
                  %{
                    "object" => "text",
                    "text" =>
                      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
                    "marks" => []
                  }
                ]
              }
            ]
          }
        }
      },
      prefix: tenant.prefix
    )

    Repo.insert!(
      %ContentModule{
        article_id: nipplejesus.id,
        type: "text",
        content: %{
          "object" => "value",
          "document" => %{
            "object" => "document",
            "data" => %{},
            "nodes" => [
              %{
                "object" => "block",
                "type" => "paragraph",
                "data" => %{},
                "nodes" => [
                  %{
                    "object" => "text",
                    "text" =>
                      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
                    "marks" => []
                  }
                ]
              }
            ]
          }
        }
      },
      prefix: tenant.prefix
    )

    Repo.insert!(
      %Article{
        category_id: projekt.id,
        title: "Beitrag Projekt 1",
        preview: "Lorem ipsum dolor sit amet.",
        published: true,
        inserted_at: ~U[2019-09-01 10:14:00Z],
        updated_at: ~U[2019-09-01 10:14:00Z]
      },
      prefix: tenant.prefix
    )

    Repo.insert!(
      %Article{
        category_id: projekt.id,
        title: "Beitrag Projekt 2",
        preview: "Lorem ipsum dolor sit amet.",
        published: true,
        inserted_at: ~U[2019-09-01 10:15:00Z],
        updated_at: ~U[2019-09-01 10:15:00Z]
      },
      prefix: tenant.prefix
    )

    Repo.insert!(
      %Article{
        category_id: projekt.id,
        title: "Beitrag Projekt 3",
        preview: "Lorem ipsum dolor sit amet.",
        published: true,
        inserted_at: ~U[2019-09-01 10:16:00Z],
        updated_at: ~U[2019-09-01 10:16:00Z]
      },
      prefix: tenant.prefix
    )

    Enum.map(4..30, fn i ->
      art1 =
        Repo.insert!(
          %Article{
            category_id: projekt.id,
            title: "Beitrag Projekt #{i} - nur für Lehrer",
            preview: "Lorem ipsum dolor sit amet.",
            published: true,
            inserted_at: DateTime.add(~U[2019-09-02 18:12:00Z], 60 * (i + 1), :second),
            updated_at: DateTime.add(~U[2019-09-02 18:12:00Z], 60 * (i + 1), :second)
          },
          prefix: tenant.prefix
        )

      art2 =
        Repo.insert!(
          %Article{
            category_id: projekt.id,
            title: "Beitrag Projekt #{i} - nur für Schüler",
            preview: "Lorem ipsum dolor sit amet.",
            published: true,
            inserted_at: DateTime.add(~U[2019-09-02 18:12:00Z], 60 * (i + 1), :second),
            updated_at: DateTime.add(~U[2019-09-02 18:12:00Z], 60 * (i + 1), :second)
          },
          prefix: tenant.prefix
        )

      assign_groups(art1, [verwaltung_group, lehrer_group])
      assign_groups(art2, [verwaltung_group, lehrer_group, schueler_group])
    end)

    :ok
  end

  defp assign_groups(model, groups) do
    model
    |> Repo.preload(:groups)
    |> Changeset.change()
    |> Changeset.put_assoc(:groups, groups)
    |> Repo.update!(prefix: Ecto.get_meta(model, :prefix))
  end
end
