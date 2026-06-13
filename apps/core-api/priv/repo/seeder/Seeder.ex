defmodule Lotta.Repo.Seeder do
  alias Lotta.{Accounts, Repo}
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

    _lehrer_group =
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

    {:ok, alexis} =
      Accounts.register_user_by_mail(tenant, %{
        name: "Alexis Rinaldoni",
        nickname: "Der Meister",
        email: "alexis.rinaldoni@lotta.schule"
      })

    alexis
    |> User.update_password_changeset("password")
    |> Repo.update!()

    {:ok, _alexis} = Accounts.update_user(alexis, %{groups: [admin_group]})

    :ok
  end
end
