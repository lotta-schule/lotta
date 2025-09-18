defmodule Lotta.TenantsTest do
  @moduledoc false

  use Lotta.WorkerCase, async: false

  alias Lotta.Accounts.User
  alias Lotta.{Tenants, Repo}
  alias Lotta.Tenants.{CustomDomain, Tenant}

  @prefix "tenant_test"

  describe "Tenants" do
    test "should get tenant by prefix" do
      assert %Tenant{prefix: @prefix} = Tenants.get_tenant_by_prefix(@prefix)
    end

    test "should get tenant by slug" do
      assert %Tenant{slug: "test"} = Tenants.get_tenant_by_slug("test")
    end

    test "should get tenant by custom domain" do
      tenant = Tenants.get_tenant_by_slug("test")

      domain = %CustomDomain{
        host: "test-domain.com",
        is_main_domain: true,
        tenant_id: tenant.id
      }

      Repo.insert!(domain)
      assert %Tenant{slug: "test"} = Tenants.get_by_custom_domain("test-domain.com")
    end

    test "should get tenant by eduplaces id" do
      Tenants.get_tenant_by_slug("test")
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_change(:eduplaces_id, "eduplaces-123")
      |> Repo.update!()

      assert %Tenant{slug: "test", eduplaces_id: "eduplaces-123"} =
               Tenants.get_tenant_by_eduplaces_id("eduplaces-123")
    end

    @tag creates_tenant: true
    test "should create a new tenant" do
      tenant = %Tenant{
        title: "Chile Lotta",
        slug: "chile"
      }

      user = %User{
        name: "Salvador Allende",
        email: "salvador.allende@einsa.net"
      }

      assert {:ok, tenant} =
               Tenants.create_tenant(
                 tenant,
                 user
               )

      assert %{title: "Chile Lotta", slug: "chile", prefix: prefix} = tenant
      assert prefix == "tenant_#{tenant.id}"

      assert [%{name: "Salvador Allende", email: "salvador.allende@einsa.net"}] =
               Repo.all(Lotta.Accounts.User, prefix: tenant.prefix)
    end

    @tag creates_tenant: true
    test "should delete a given tenant" do
      tenant = %Tenant{
        title: "Chile Lotta",
        slug: "chile"
      }

      user = %User{
        name: "Salvador Allende",
        email: "salvador.allende@einsa.net"
      }

      assert {:ok, tenant} =
               Tenants.create_tenant(
                 tenant,
                 user
               )

      assert {:ok, _tenant} = Tenants.delete_tenant(tenant)

      assert_raise Postgrex.Error, fn ->
        Repo.all(Lotta.Accounts.User, prefix: tenant.prefix)
      end

      assert is_nil(Tenants.get_tenant(tenant.id))
    end

    test "slug_available?/1 returns false for occupied slugs" do
      assert Tenants.slug_available?("test") == false
    end

    test "slug_available?/1 returns false for reserved slugs" do
      assert Tenants.slug_available?("admin") == false
      assert Tenants.slug_available?("api") == false
      assert Tenants.slug_available?("www") == false
    end

    test "slug_available?/1 returns true for available slugs" do
      assert Tenants.slug_available?("available-slug") == true
    end

    test "get_occupied_slugs/0 returns list of occupied slugs" do
      occupied_slugs = Tenants.get_occupied_slugs()
      assert "test" in occupied_slugs
    end

    test "get_reserved_slugs/0 returns list of reserved slugs" do
      reserved_slugs = Tenants.get_reserved_slugs()
      assert "admin" in reserved_slugs
      assert "api" in reserved_slugs
      assert "www" in reserved_slugs
    end

    @tag creates_tenant: true
    test "should create a new tenant with eduplaces user" do
      import Mock

      tenant = %Tenant{
        title: "Eduplaces School",
        slug: "eduplaces"
      }

      user = %User{
        eduplaces_id: "eduplaces-user-123"
      }

      with_mock(Lotta.Accounts,
        register_eduplaces_user: fn tenant, _user_info ->
          {:ok,
           %User{
             id: 999,
             name: "Test User",
             email: "test@eduplaces.com",
             eduplaces_id: "eduplaces-user-123",
             groups: []
           }
           |> Repo.insert!(prefix: tenant.prefix)}
        end
      ) do
        assert {:ok, tenant} = Tenants.create_tenant(tenant, user)

        assert %{title: "Eduplaces School", slug: "eduplaces", prefix: prefix} = tenant
        assert prefix == "tenant_#{tenant.id}"

        assert_called(
          Lotta.Accounts.register_eduplaces_user(tenant, %Lotta.Eduplaces.UserInfo{
            id: "eduplaces-user-123"
          })
        )
      end
    end

    @tag creates_tenant: true
    test "should fail to create tenant when neither email nor eduplaces_id is provided" do
      tenant = %Tenant{
        title: "Invalid User Tenant",
        slug: "invalid"
      }

      user = %User{
        name: "Test User"
      }

      assert {:error, _} = Tenants.create_tenant(tenant, user)
    end
  end

  describe "Tenant.generate_slug/1" do
    test "generates slug from title with lowercase and dashes" do
      assert Tenant.generate_slug("My Cool School") == "my-cool-school"
    end

    test "replaces special characters with dashes" do
      assert Tenant.generate_slug("Schüle für Künste & Wissenschaft!") ==
               "sch-le-f-r-k-nste-wissenschaft"
    end

    test "handles German umlauts and special characters" do
      assert Tenant.generate_slug("Schule für Überlegene Bildung") ==
               "schule-f-r-berlegene-bildung"
    end

    test "removes leading and trailing dashes" do
      assert Tenant.generate_slug("!!!My School!!!") == "my-school"
      assert Tenant.generate_slug("   School   ") == "school"
    end

    test "handles multiple consecutive special characters" do
      assert Tenant.generate_slug("My---Cool___School") == "my-cool-school"
    end

    test "handles numbers in title" do
      assert Tenant.generate_slug("School 123") == "school-123"
      assert Tenant.generate_slug("42 Academy") == "42-academy"
    end

    test "handles empty string" do
      assert Tenant.generate_slug("") == ""
    end

    test "handles string with only special characters" do
      assert Tenant.generate_slug("!!!@@@###") == ""
    end

    test "finds available slug when base slug is occupied" do
      import Mock

      # Mock slug_available? to return false for "test" and true for "test-2"
      with_mock(Tenants, [:passthrough],
        slug_available?: fn
          "test" -> false
          "test-2" -> true
          _ -> true
        end
      ) do
        assert Tenant.generate_slug("Test") == "test-2"
      end
    end

    test "increments suffix until available slug is found" do
      import Mock

      # Mock slug_available? to return false for "school" through "school-5", true for "school-6"
      with_mock(Tenants, [:passthrough],
        slug_available?: fn
          "school" -> false
          "school-2" -> false
          "school-3" -> false
          "school-4" -> false
          "school-5" -> false
          "school-6" -> true
          _ -> true
        end
      ) do
        assert Tenant.generate_slug("School") == "school-6"
      end
    end

    test "returns nil when no available slug found within 1000 attempts" do
      import Mock

      # Mock slug_available? to always return false
      with_mock(Tenants, [:passthrough], slug_available?: fn _ -> false end) do
        assert Tenant.generate_slug("School") == nil
      end
    end

    test "returns base slug when it's available" do
      import Mock

      # Mock slug_available? to return true for any slug
      with_mock(Tenants, [:passthrough], slug_available?: fn _ -> true end) do
        assert Tenant.generate_slug("Available School") == "available-school"
      end
    end

    test "handles complex real-world school names" do
      import Mock

      with_mock(Tenants, [:passthrough], slug_available?: fn _ -> true end) do
        assert Tenant.generate_slug("Gymnasium St. Maria-Magdalena") ==
                 "gymnasium-st-maria-magdalena"

        assert Tenant.generate_slug("École Française de Berlin") == "cole-fran-aise-de-berlin"
        # Chinese characters get removed
        assert Tenant.generate_slug("北京第一中学") == ""
        # Cyrillic gets removed, numbers stay
        assert Tenant.generate_slug("Школа №42") == "42"
      end
    end

    test "handles very long titles" do
      import Mock

      with_mock(Tenants, [:passthrough], slug_available?: fn _ -> true end) do
        long_title = String.duplicate("Very Long School Name ", 10)
        slug = Tenant.generate_slug(long_title)
        assert slug == String.duplicate("very-long-school-name-", 9) <> "very-long-school-name"
        assert String.length(slug) > 200
      end
    end
  end
end
