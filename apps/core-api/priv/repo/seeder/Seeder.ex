defmodule Lotta.Repo.Seeder do
  alias Lotta.{Accounts, Tenants, Repo}
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Tenants.{Tenant, TenantDbManager}

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

    _verwaltung_group =
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

    _schueler_group =
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

    {:ok, _alexis} = Accounts.update_user(alexis, %{groups: [admin_group]})
    {:ok, _eike} = Accounts.update_user(eike, %{groups: [lehrer_group]})

    :ok
  end
end
