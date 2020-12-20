defmodule Api.Repo.Seeder do
  alias Api.Repo
  alias Ecto.Changeset
  alias Api.Accounts
  alias Api.System
  alias Api.Accounts.{Directory, File, UserGroup}
  alias Api.Content.{Article, ContentModule}
  alias Api.Messages.Message
  alias Api.System.{Category, CustomDomain, Widget}

  def seed() do
    Repo.insert!(%CustomDomain{host: "lotta.web", is_main_domain: true})

    system = System.get_configuration()

    System.put_configuration(system, :custom_theme, %{
      "palette" => %{
        "primary" => %{"main" => "red"},
        "secondary" => %{"main" => "green"}
      }
    })

    System.put_configuration(system, :title, "Lotta")

    admin_group =
      Repo.insert!(%UserGroup{
        name: "Administration",
        is_admin_group: true,
        sort_key: 1000
      })

    verwaltung_group = Repo.insert!(%UserGroup{name: "Verwaltung", sort_key: 800})

    lehrer_group = Repo.insert!(%UserGroup{name: "Lehrer", sort_key: 600})

    schueler_group = Repo.insert!(%UserGroup{name: "Schüler", sort_key: 400})

    Ecto.build_assoc(lehrer_group, :enrollment_tokens)
    |> Map.put(:token, "LEb0815Hp!1969")
    |> Repo.insert!()

    Ecto.build_assoc(schueler_group, :enrollment_tokens)
    |> Map.put(:token, "Seb034hP2?019")
    |> Repo.insert!()

    {:ok, _lotta_admin} =
      Accounts.register_user(%{
        name: "Alexis Rinaldoni",
        email: "alexis.rinaldoni@einsa.net",
        password: "test123"
      })

    {:ok, alexis} =
      Accounts.register_user(%{
        name: "Alexis Rinaldoni",
        nickname: "Der Meister",
        email: "alexis.rinaldoni@lotta.schule",
        password: "test123"
      })

    {:ok, billy} =
      Accounts.register_user(%{
        name: "Christopher Bill",
        nickname: "Billy",
        email: "billy@lotta.schule",
        password: "test123",
        enrollment_tokens: ["Seb034hP2?019"]
      })

    {:ok, eike} =
      Accounts.register_user(%{
        name: "Eike Wiewiorra",
        nickname: "Chef",
        email: "eike.wiewiorra@lotta.schule",
        password: "test123"
      })

    {:ok, dr_evil} =
      Accounts.register_user(%{
        name: "Dr Evil",
        nickname: "drEvil",
        email: "drevil@lotta.schule",
        password: "test123"
      })

    Accounts.register_user(%{
      name: "Max Mustermann",
      nickname: "MaXi",
      email: "maxi@lotta.schule",
      password: "test123"
    })

    Accounts.register_user(%{
      name: "Dorothea Musterfrau",
      nickname: "Doro",
      email: "doro@lotta.schule",
      password: "test123"
    })

    Accounts.register_user(%{
      name: "Marie Curie",
      nickname: "Polonium",
      email: "mcurie@lotta.schule",
      hide_full_name: true,
      password: "test456"
    })

    Accounts.update_user(alexis, %{groups: [admin_group]})
    Accounts.update_user(eike, %{groups: [lehrer_group]})
    Accounts.update_user(dr_evil, %{is_blocked: true})

    # public files
    public_logos = %Directory{name: "logos"} |> Repo.insert!()

    public_logos_podcast =
      %Directory{name: "podcast", parent_directory_id: public_logos.id}
      |> Repo.insert!()

    public_logos_chamaeleon =
      %Directory{
        name: "chamaeleon",
        parent_directory_id: public_logos.id
      }
      |> Repo.insert!()

    public_hintergrund = %Directory{name: "hintergrund"} |> Repo.insert!()

    public_files =
      [
        %File{
          parent_directory_id: public_logos.id,
          filename: "logo1.jpg",
          remote_location: "http://a.de/logo1.jpg",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/jpg"
        },
        %File{
          parent_directory_id: public_logos.id,
          filename: "logo2.jpg",
          remote_location: "http://a.de/logo2.jpg",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/jpg"
        },
        %File{
          parent_directory_id: public_logos.id,
          filename: "logo3.png",
          remote_location: "http://a.de/logo3.png",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/png"
        },
        %File{
          parent_directory_id: public_logos.id,
          filename: "logo4.png",
          remote_location: "http://a.de/logo4.png",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/png"
        },
        %File{
          parent_directory_id: public_logos_podcast.id,
          filename: "podcast1.png",
          remote_location: "http://a.de/podcast1.png",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/png"
        },
        %File{
          parent_directory_id: public_logos_podcast.id,
          filename: "podcast2.png",
          remote_location: "http://a.de/podcast2.png",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/png"
        },
        %File{
          parent_directory_id: public_logos_chamaeleon.id,
          filename: "chamaeleon.png",
          remote_location: "http://a.de/chamaeleon.png",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/png"
        },
        %File{
          parent_directory_id: public_hintergrund.id,
          filename: "hg_dunkel.jpg",
          remote_location: "http://a.de/hg_dunkel.jpg",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/jpg"
        },
        %File{
          parent_directory_id: public_hintergrund.id,
          filename: "hg_hell.jpg",
          remote_location: "http://a.de/hg_hell.jpg",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/jpg"
        },
        %File{
          parent_directory_id: public_hintergrund.id,
          filename: "hg_comic.png",
          remote_location: "http://a.de/hg_comic.png",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/png"
        },
        %File{
          parent_directory_id: public_hintergrund.id,
          filename: "hg_grafik.png",
          remote_location: "http://a.de/hg_grafik.png",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/png"
        }
      ]
      |> Enum.map(fn file ->
        file
        |> Map.put(:user_id, alexis.id)
        |> Repo.insert!()
      end)

    # alexis' files
    avatar_directory = %Directory{name: "logos", user_id: alexis.id} |> Repo.insert!()

    irgendwas_directory =
      %Directory{name: "irgendwas", user_id: alexis.id}
      |> Repo.insert!()

    podcast_directory = %Directory{name: "podcast", user_id: alexis.id} |> Repo.insert!()

    alexis_files =
      [
        %File{
          parent_directory_id: avatar_directory.id,
          filename: "ich_schoen.jpg",
          remote_location: "http://a.de/0801801",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/jpg"
        },
        %File{
          parent_directory_id: avatar_directory.id,
          filename: "ich_haesslich.jpg",
          remote_location: "http://a.de/828382383",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/jpg"
        },
        %File{
          parent_directory_id: irgendwas_directory.id,
          filename: "irgendwas.png",
          remote_location: "https://placeimg.com/5/5/any",
          filesize: 713,
          file_type: "image",
          mime_type: "image/png"
        },
        %File{
          parent_directory_id: irgendwas_directory.id,
          filename: "wasanderes.png",
          remote_location: "http://a.de/28374892374",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/png"
        },
        %File{
          parent_directory_id: podcast_directory.id,
          filename: "podcast1.mp4",
          remote_location: "http://a.de/82734897238497",
          filesize: 12288,
          media_duration: 152.5,
          file_type: "video",
          mime_type: "video/mp4"
        },
        %File{
          parent_directory_id: podcast_directory.id,
          filename: "podcast2.mov",
          remote_location: "http://a.de/82734897238498",
          filesize: 12288,
          media_duration: 69.1,
          file_type: "video",
          mime_type: "video/mov"
        },
        %File{
          parent_directory_id: podcast_directory.id,
          filename: "pc3.m4v",
          remote_location: "http://a.de/82734897238499",
          filesize: 12288,
          media_duration: 259.3,
          file_type: "video",
          mime_type: "video/m4v"
        }
      ]
      |> Enum.map(fn file ->
        file
        |> Map.put(:user_id, alexis.id)
        |> Repo.insert!()
      end)

    alexis
    |> Repo.preload(:avatar_image_file)
    |> Changeset.change()
    |> Changeset.put_assoc(:avatar_image_file, List.first(alexis_files))
    |> Repo.update!()

    # Eike' files
    avatar_directory = %Directory{name: "avatar", user_id: eike.id} |> Repo.insert!()

    eoa_directory =
      %Directory{name: "ehrenberg-on-air", user_id: eike.id}
      |> Repo.insert!()

    podcast_directory = %Directory{name: "podcast", user_id: eike.id} |> Repo.insert!()

    eike_files =
      [
        %File{
          parent_directory_id: avatar_directory.id,
          filename: "wieartig1.jpg",
          remote_location: "http://a.de/0801345801",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/jpg"
        },
        %File{
          parent_directory_id: avatar_directory.id,
          filename: "wieartig2.jpg",
          remote_location: "http://a.de/828382123383",
          filesize: 12288,
          file_type: "image",
          mime_type: "image/jpg"
        },
        %File{
          parent_directory_id: eoa_directory.id,
          filename: "eoa2.mp3",
          remote_location: "http://a.de/08234980234239",
          filesize: 12288,
          file_type: "audio",
          mime_type: "audio/mp3"
        },
        %File{
          parent_directory_id: eoa_directory.id,
          filename: "eoa3.mp3",
          remote_location: "http://a.de/28374234892374",
          filesize: 12288,
          file_type: "audio",
          mime_type: "audio/mp3"
        },
        %File{
          parent_directory_id: podcast_directory.id,
          filename: "podcast5.mp4",
          remote_location: "http://a.de/7238497",
          filesize: 12288,
          file_type: "video",
          mime_type: "video/mp4"
        },
        %File{
          parent_directory_id: podcast_directory.id,
          filename: "podcast6.mov",
          remote_location: "http://a.de/97238498",
          filesize: 12288,
          file_type: "video",
          mime_type: "video/mov"
        },
        %File{
          parent_directory_id: podcast_directory.id,
          filename: "pocst7.m4v",
          remote_location: "http://a.de/8238499",
          filesize: 12288,
          file_type: "video",
          mime_type: "video/m4v"
        }
      ]
      |> Enum.map(fn file ->
        file
        |> Map.put(:user_id, eike.id)
        |> Repo.insert!()
      end)

    [
      %Message{
        sender_user_id: alexis.id,
        recipient_user_id: eike.id,
        inserted_at: ~N[2020-11-01 10:00:00],
        updated_at: ~N[2020-11-01 10:00:00],
        content: "OK, alles bereit?"
      },
      %Message{
        sender_user_id: eike.id,
        recipient_user_id: alexis.id,
        inserted_at: ~N[2020-11-01 12:30:00],
        updated_at: ~N[2020-11-01 12:30:00],
        content: "Was meinst du damit?"
      },
      %Message{
        sender_user_id: alexis.id,
        recipient_user_id: eike.id,
        inserted_at: ~N[2020-11-01 12:32:00],
        updated_at: ~N[2020-11-01 12:32:00],
        content: "Bereit für das Deployment"
      },
      %Message{
        sender_user_id: eike.id,
        recipient_user_id: alexis.id,
        inserted_at: ~N[2020-11-01 13:12:00],
        updated_at: ~N[2020-11-01 13:12:00],
        content: "Ich frag mal in die Gruppe"
      },
      %Message{
        sender_user_id: eike.id,
        recipient_group_id: lehrer_group.id,
        inserted_at: ~N[2020-11-01 13:12:46],
        updated_at: ~N[2020-11-01 13:12:46],
        content: "Alles bereit hier? Wir würden deployen."
      },
      %Message{
        sender_user_id: billy.id,
        recipient_user_id: alexis.id,
        inserted_at: ~N[2020-11-01 21:01:44],
        updated_at: ~N[2020-11-01 21:01:44],
        content: "Bist du da?"
      }
    ]
    |> Enum.map(&Repo.insert!(&1))

    homepage = Repo.insert!(%Category{title: "Start", is_homepage: true})

    profil =
      Repo.insert!(%Category{
        sort_key: 10,
        title: "Profil",
        banner_image_file_id: List.first(public_files).id
      })

    gta =
      Repo.insert!(%Category{
        sort_key: 20,
        title: "GTA",
        banner_image_file_id: List.first(public_files).id
      })

    projekt =
      Repo.insert!(%Category{
        sort_key: 30,
        title: "Projekt",
        banner_image_file_id: List.first(public_files).id
      })

    faecher =
      Repo.insert!(%Category{
        sort_key: 40,
        title: "Fächer",
        banner_image_file_id: List.first(public_files).id
      })

    material = Repo.insert!(%Category{sort_key: 50, title: "Material"})
    Repo.insert!(%Category{sort_key: 60, title: "Galerien"})

    Repo.insert!(%Category{
      sort_key: 70,
      title: "Impressum",
      is_sidenav: true
    })

    assign_groups(profil, [verwaltung_group])
    assign_groups(gta, [verwaltung_group, lehrer_group, schueler_group])
    assign_groups(faecher, [verwaltung_group, lehrer_group, schueler_group])
    assign_groups(material, [verwaltung_group, lehrer_group])

    # Fächer
    Repo.insert!(%Category{
      sort_key: 10,
      title: "Sport",
      category_id: faecher.id
    })

    Repo.insert!(%Category{
      sort_key: 20,
      title: "Kunst",
      category_id: faecher.id
    })

    Repo.insert!(%Category{
      sort_key: 30,
      title: "Sprache",
      category_id: faecher.id
    })
    |> assign_groups([verwaltung_group, lehrer_group])

    # Profil
    Repo.insert!(%Category{
      sort_key: 10,
      title: "Podcast",
      category_id: profil.id
    })

    Repo.insert!(%Category{
      sort_key: 20,
      title: "Offene Kunst-AG",
      category_id: profil.id
    })

    Repo.insert!(%Category{
      sort_key: 30,
      title: "Schülerzeitung",
      category_id: profil.id
    })

    Repo.insert!(%Category{
      sort_key: 40,
      title: "Oskar-Reime-Chor",
      category_id: profil.id
    })

    Repo.insert!(%Category{
      sort_key: 50,
      title: "Schüler-Radio",
      category_id: profil.id
    })

    # Kalender-Widgets
    widget1 = Repo.insert!(%Widget{title: "Kalender", type: "calendar"})
    widget2 = Repo.insert!(%Widget{title: "Kalender", type: "calendar"})
    widget3 = Repo.insert!(%Widget{title: "Kalender", type: "calendar"})
    assign_groups(widget2, [verwaltung_group, lehrer_group])
    assign_groups(widget3, [verwaltung_group, lehrer_group])

    homepage
    |> Repo.preload(:widgets)
    |> Changeset.change()
    |> Changeset.put_assoc(:widgets, [widget1, widget2, widget3])
    |> Repo.update!()

    # Articles

    Repo.insert!(%Article{
      title: "Draft1",
      preview: "Entwurf Artikel zu I",
      inserted_at: ~N[2019-09-01 10:00:00],
      updated_at: ~N[2019-09-01 10:00:00],
      preview_image_file_id: List.first(eike_files).id
    })
    |> Repo.preload(:users)
    |> Changeset.change()
    |> Changeset.put_assoc(:users, [eike])
    |> Repo.update!()

    Repo.insert!(%Article{
      title: "Draft2",
      preview: "Entwurf Artikel zu XYZ",
      inserted_at: ~N[2019-09-01 10:05:00],
      updated_at: ~N[2019-09-01 10:05:00],
      preview_image_file_id: List.first(eike_files).id
    })
    |> Repo.preload(:users)
    |> Changeset.change()
    |> Changeset.put_assoc(:users, [eike])
    |> Repo.update!()

    Repo.insert!(%Article{
      title: "Fertiger Artikel zum Konzert",
      preview: "Entwurf Artikel zu XYZ",
      ready_to_publish: true,
      inserted_at: ~N[2019-09-01 10:06:00],
      updated_at: ~N[2019-09-01 10:06:00],
      preview_image_file_id: List.first(eike_files).id
    })
    |> Repo.preload(:users)
    |> Changeset.change()
    |> Changeset.put_assoc(:users, [eike])
    |> Repo.update!()

    oskar_goes_to =
      Repo.insert!(%Article{
        category_id: profil.id,
        title: "And the oskar goes to ...",
        preview: "Hallo hallo hallo",
        inserted_at: ~N[2019-09-01 10:08:00],
        updated_at: ~N[2019-09-01 10:08:00]
      })

    Repo.insert!(%ContentModule{
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
    })

    Repo.insert!(%ContentModule{
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
    })

    form =
      Repo.insert!(%ContentModule{
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
              "descriptionText" => "Falls du ein Gutschein hast, fotografier ihn und füge ihn hier an.",
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
                %{"label" => "klein (22cm Durchmesser)", "selected" => true, "value" => "klein"},
                %{"label" => "groß (28cm Durchmesser)", "selected" => false, "value" => "groß"},
                %{"label" => "Familienpizza (50x60cm)", "selected" => false, "value" => "familie"}
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
                %{"label" => "zusätzliche Peperoni", "selected" => false, "value" => "peperoni"},
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
      })

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
    |> Repo.insert!()

    landesfinale =
      Repo.insert!(%Article{
        category_id: profil.id,
        title: "Landesfinale Volleyball WK IV",
        preview:
          "Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale \"Jugend trainiert für Europa\" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...",
        inserted_at: ~N[2019-09-01 10:09:00],
        updated_at: ~N[2019-09-01 10:09:00]
      })

    Repo.insert!(%ContentModule{
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
    })

    Repo.insert!(%ContentModule{
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
    })

    kleinkunst_wb2 =
      Repo.insert!(%Article{
        category_id: profil.id,
        title: "Der Podcast zum WB 2",
        preview:
          "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.",
        topic: "KleinKunst 2018",
        inserted_at: ~N[2019-09-01 10:11:00],
        updated_at: ~N[2019-09-01 10:11:00]
      })

    assign_groups(kleinkunst_wb2, [verwaltung_group, lehrer_group, schueler_group])

    Repo.insert!(%ContentModule{
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
    })

    Repo.insert!(%ContentModule{
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
    })

    vorausscheid =
      Repo.insert!(%Article{
        category_id: profil.id,
        title: "Der Vorausscheid",
        preview:
          "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.",
        topic: "KleinKunst 2018",
        inserted_at: ~N[2019-09-01 10:12:00],
        updated_at: ~N[2019-09-01 10:12:00]
      })

    assign_groups(vorausscheid, [verwaltung_group, lehrer_group])

    Repo.insert!(%ContentModule{
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
    })

    Repo.insert!(%ContentModule{
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
    })

    nipplejesus =
      Repo.insert!(%Article{
        category_id: projekt.id,
        title: "„Nipple Jesus“- eine extreme Erfahrung",
        preview:
          "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.",
        inserted_at: ~N[2019-09-01 10:13:00],
        updated_at: ~N[2019-09-01 10:13:00]
      })

    Repo.insert!(%ContentModule{
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
    })

    Repo.insert!(%ContentModule{
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
    })

    Repo.insert!(%Article{
      category_id: projekt.id,
      title: "Beitrag Projekt 1",
      preview: "Lorem ipsum dolor sit amet.",
      inserted_at: ~N[2019-09-01 10:14:00],
      updated_at: ~N[2019-09-01 10:14:00]
    })

    Repo.insert!(%Article{
      category_id: projekt.id,
      title: "Beitrag Projekt 2",
      preview: "Lorem ipsum dolor sit amet.",
      inserted_at: ~N[2019-09-01 10:15:00],
      updated_at: ~N[2019-09-01 10:15:00]
    })

    Repo.insert!(%Article{
      category_id: projekt.id,
      title: "Beitrag Projekt 3",
      preview: "Lorem ipsum dolor sit amet.",
      inserted_at: ~N[2019-09-01 10:16:00],
      updated_at: ~N[2019-09-01 10:16:00]
    })

    Enum.map(4..30, fn i ->
      art1 =
        Repo.insert!(%Article{
          category_id: projekt.id,
          title: "Beitrag Projekt #{i} - nur für Lehrer",
          preview: "Lorem ipsum dolor sit amet.",
          inserted_at: NaiveDateTime.add(~N[2019-09-02 18:12:00], 60 * (i + 1), :second),
          updated_at: NaiveDateTime.add(~N[2019-09-02 18:12:00], 60 * (i + 1), :second)
        })

      art2 =
        Repo.insert!(%Article{
          category_id: projekt.id,
          title: "Beitrag Projekt #{i} - nur für Schüler",
          preview: "Lorem ipsum dolor sit amet.",
          inserted_at: NaiveDateTime.add(~N[2019-09-02 18:12:00], 60 * (i + 1), :second),
          updated_at: NaiveDateTime.add(~N[2019-09-02 18:12:00], 60 * (i + 1), :second)
        })

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
    |> Repo.update!()
  end
end
