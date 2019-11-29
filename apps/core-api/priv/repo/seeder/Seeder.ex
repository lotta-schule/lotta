defmodule Api.Repo.Seeder do

  def seed() do
    web_tenant = Api.Repo.insert!(%Api.Tenants.Tenant{slug: "web", title: "Web Beispiel"})
    web_tenant
    |> Ecto.build_assoc(:custom_domains, %{ host: "lotta.web", is_main_domain: true })
    |> Api.Repo.insert!() # add "lotta.web" as custom domain
    lotta_tenant = Api.Repo.insert!(%Api.Tenants.Tenant{slug: "lotta", title: "Lotta"})
  
    admin_group = Api.Repo.insert!(%Api.Accounts.UserGroup{tenant_id: web_tenant.id, name: "Administration", is_admin_group: true, sort_key: 1000})
    verwaltung_group = Api.Repo.insert!(%Api.Accounts.UserGroup{tenant_id: web_tenant.id, name: "Verwaltung", sort_key: 800})
    lehrer_group = Api.Repo.insert!(%Api.Accounts.UserGroup{tenant_id: web_tenant.id, name: "Lehrer", sort_key: 600})
    schueler_group = Api.Repo.insert!(%Api.Accounts.UserGroup{tenant_id: web_tenant.id, name: "Schüler", sort_key: 400})
  
    {:ok, alexis} = Api.Accounts.register_user(%{
        name: "Alexis Rinaldoni",
        nickname: "Der Meister",
        email: "alexis.rinaldoni@einsa.net",
        password: "test123",
        tenant_id: web_tenant.id
    })
    {:ok, billy} = Api.Accounts.register_user(%{
        name: "Christopher Bill",
        nickname: "Billy",
        email: "billy@einsa.net",
        password: "test123",
        tenant_id: web_tenant.id
    })
    {:ok, eike} = Api.Accounts.register_user(%{
        name: "Eike Wiewiorra",
        nickname: "Chef",
        email: "eike.wiewiorra@einsa.net",
        password: "test123",
        tenant_id: web_tenant.id
    })
    Api.Accounts.register_user(%{name: "Max Mustermann", nickname: "MaXi", email: "maxi@einsa.net", password: "test123", tenant_id: web_tenant.id})
    Api.Accounts.register_user(%{name: "Dorothea Musterfrau", nickname: "Doro", email: "doro@einsa.net", password: "test123", tenant_id: web_tenant.id})
    Api.Accounts.register_user(%{name: "Marie Curie", nickname: "Polonium", email: "mcurie@lotta.schule", password: "test456", tenant_id: lotta_tenant.id})
  
    Api.Accounts.set_user_groups(alexis, web_tenant, [admin_group])
    Api.Accounts.set_user_groups(billy, web_tenant, [schueler_group])
    Api.Accounts.set_user_groups(eike, web_tenant, [lehrer_group])
  
    homepage = Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, title: "Start", is_homepage: true})
    profil = Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 10, title: "Profil"})
    gta = Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 20, title: "GTA"})
    projekt = Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 30, title: "Projekt"})
    faecher = Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 40, title: "Fächer"})
    material = Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 50, title: "Material"})
    Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 60, title: "Galerien"})
    Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 70, title: "Impressum", is_sidenav: true})
    assign_groups(profil, [verwaltung_group])
    assign_groups(gta, [verwaltung_group, lehrer_group, schueler_group])
    assign_groups(faecher, [verwaltung_group, lehrer_group, schueler_group])
    assign_groups(material, [verwaltung_group, lehrer_group])
  
    # Fächer
    Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 10, title: "Sport", category_id: faecher.id})
    Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 20, title: "Kunst", category_id: faecher.id})
    Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 30, title: "Sprache", category_id: faecher.id})
    |> assign_groups([verwaltung_group, lehrer_group])
  
    # Profil
    Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 10, title: "Podcast", category_id: profil.id})
    Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 20, title: "Offene Kunst-AG", category_id: profil.id})
    Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 30, title: "Schülerzeitung", category_id: profil.id})
    Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 40, title: "Oskar-Reime-Chor", category_id: profil.id})
    Api.Repo.insert!(%Api.Tenants.Category{tenant_id: web_tenant.id, sort_key: 50, title: "Schüler-Radio", category_id: profil.id})
  
    # Kalender-Widgets
    widget1 = Api.Repo.insert!(%Api.Tenants.Widget{tenant_id: web_tenant.id, title: "Kalender", type: "calendar"})
    widget2 = Api.Repo.insert!(%Api.Tenants.Widget{tenant_id: web_tenant.id, title: "Kalender", type: "calendar"})
    widget3 = Api.Repo.insert!(%Api.Tenants.Widget{tenant_id: web_tenant.id, title: "Kalender", type: "calendar"})
    assign_groups(widget2, [verwaltung_group, lehrer_group])
    assign_groups(widget3, [verwaltung_group, lehrer_group])

    homepage
    |> Api.Repo.preload(:widgets)
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:widgets, [widget1, widget2, widget3])
    |> Api.Repo.update()
  
    # Articles
    
    Api.Repo.insert(%Api.Content.Article{
      tenant_id: web_tenant.id,
      title: "Draft1",
      preview: "Entwurf Artikel zu I",
      inserted_at: ~N[2019-09-01 10:00:00],
      updated_at: ~N[2019-09-01 10:00:00]
    })
    |> elem(1)
    |> Api.Repo.preload(:users)
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:users, [eike])
    |> Api.Repo.update()
    Api.Repo.insert(%Api.Content.Article{
      tenant_id: web_tenant.id,
      title: "Draft2",
      preview: "Entwurf Artikel zu XYZ",
      inserted_at: ~N[2019-09-01 10:05:00],
      updated_at: ~N[2019-09-01 10:05:00]
    })
    |> elem(1)
    |> Api.Repo.preload(:users)
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:users, [eike])
    |> Api.Repo.update()
    Api.Repo.insert(%Api.Content.Article{
      tenant_id: web_tenant.id,
      title: "Fertiger Artikel zum Konzert",
      preview: "Entwurf Artikel zu XYZ",
      ready_to_publish: true,
      inserted_at: ~N[2019-09-01 10:06:00],
      updated_at: ~N[2019-09-01 10:06:00]
    })
    |> elem(1)
    |> Api.Repo.preload(:users)
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:users, [eike])
    |> Api.Repo.update()

    oskar_goes_to = Api.Repo.insert!(%Api.Content.Article{
        tenant_id: web_tenant.id,
        category_id: profil.id,
        title: "And the oskar goes to ...",
        preview: "Hallo hallo hallo",
        inserted_at: ~N[2019-09-01 10:08:00],
        updated_at: ~N[2019-09-01 10:08:00]
    })
    Api.Repo.insert!(%Api.Content.ContentModule{article_id: oskar_goes_to.id, type: "text", text: "JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q="})
    Api.Repo.insert!(%Api.Content.ContentModule{article_id: oskar_goes_to.id, type: "text", text: "JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q="})
    landesfinale = Api.Repo.insert!(%Api.Content.Article{
        tenant_id: web_tenant.id,
        category_id: profil.id,
        title: "Landesfinale Volleyball WK IV",
        preview: "Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale \"Jugend trainiert für Europa\" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...",
        inserted_at: ~N[2019-09-01 10:09:00],
        updated_at: ~N[2019-09-01 10:09:00]
    })
    Api.Repo.insert!(%Api.Content.ContentModule{article_id: landesfinale.id, type: "text", text: "JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q="})
    Api.Repo.insert!(%Api.Content.ContentModule{article_id: landesfinale.id, type: "text", text: "JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q="})
    kleinkunst_wb2 = Api.Repo.insert!(%Api.Content.Article{
        tenant_id: web_tenant.id,
        category_id: profil.id,
        title: "Der Podcast zum WB 2",
        preview: "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.",
        topic: "KleinKunst 2018",
        inserted_at: ~N[2019-09-01 10:11:00],
        updated_at: ~N[2019-09-01 10:11:00]
    })
    assign_groups(kleinkunst_wb2, [verwaltung_group, lehrer_group, schueler_group])
    Api.Repo.insert!(%Api.Content.ContentModule{article_id: kleinkunst_wb2.id, type: "text", text: "JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q="})
    Api.Repo.insert!(%Api.Content.ContentModule{article_id: kleinkunst_wb2.id, type: "text", text: "JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q="})
    vorausscheid = Api.Repo.insert!(%Api.Content.Article{
        tenant_id: web_tenant.id,
        category_id: profil.id,
        title: "Der Vorausscheid",
        preview: "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.",
        topic: "KleinKunst 2018",
        inserted_at: ~N[2019-09-01 10:12:00],
        updated_at: ~N[2019-09-01 10:12:00]
    })
    assign_groups(vorausscheid, [verwaltung_group, lehrer_group])
    Api.Repo.insert!(%Api.Content.ContentModule{article_id: vorausscheid.id, type: "text", text: "JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q="})
    Api.Repo.insert!(%Api.Content.ContentModule{article_id: vorausscheid.id, type: "text", text: "JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q="})
    nipplejesus = Api.Repo.insert!(%Api.Content.Article{
        tenant_id: web_tenant.id,
        category_id: projekt.id,
        title: "„Nipple Jesus“- eine extreme Erfahrung",
        preview: "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.",
        inserted_at: ~N[2019-09-01 10:13:00],
        updated_at: ~N[2019-09-01 10:13:00]
    })
    Api.Repo.insert!(%Api.Content.ContentModule{article_id: nipplejesus.id, type: "text", text: "JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q="})
    Api.Repo.insert!(%Api.Content.ContentModule{article_id: nipplejesus.id, type: "text", text: "JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q="})

    Api.Repo.insert!(%Api.Content.Article{
        tenant_id: web_tenant.id,
        category_id: projekt.id,
        title: "Beitrag Projekt 1",
        preview: "Lorem ipsum dolor sit amet.",
        inserted_at: ~N[2019-09-01 10:14:00],
        updated_at: ~N[2019-09-01 10:14:00]
    })
    Api.Repo.insert!(%Api.Content.Article{
        tenant_id: web_tenant.id,
        category_id: projekt.id,
        title: "Beitrag Projekt 2",
        preview: "Lorem ipsum dolor sit amet.",
        inserted_at: ~N[2019-09-01 10:15:00],
        updated_at: ~N[2019-09-01 10:15:00]
    })
    Api.Repo.insert!(%Api.Content.Article{
        tenant_id: web_tenant.id,
        category_id: projekt.id,
        title: "Beitrag Projekt 3",
        preview: "Lorem ipsum dolor sit amet.",
        inserted_at: ~N[2019-09-01 10:16:00],
        updated_at: ~N[2019-09-01 10:16:00]
    })
    Enum.map(4..30, fn i ->
      art1 = Api.Repo.insert!(%Api.Content.Article{
          tenant_id: web_tenant.id,
          category_id: projekt.id,
          title: "Beitrag Projekt #{i} - nur für Lehrer",
          preview: "Lorem ipsum dolor sit amet.",
          inserted_at: NaiveDateTime.add(~N[2019-09-02 18:12:00], 60 * (i + 1), :second),
          updated_at: NaiveDateTime.add(~N[2019-09-02 18:12:00], 60 * (i + 1), :second)
      })
      art2 = Api.Repo.insert!(%Api.Content.Article{
          tenant_id: web_tenant.id,
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
    |> Api.Repo.preload(:groups)
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:groups, groups)
    |> Api.Repo.update()
  end
end