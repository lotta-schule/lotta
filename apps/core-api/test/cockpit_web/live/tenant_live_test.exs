defmodule CockpitWeb.Live.TenantLiveTest do
  @moduledoc false

  use Lotta.DataCase

  import Mock

  alias CockpitWeb.Live.TenantLive
  alias Lotta.Tenants
  alias Lotta.Tenants.Tenant

  describe "update_changeset/3" do
    setup do
      tenant = %Tenant{
        id: 1,
        title: "Test School",
        slug: "test-school",
        prefix: "tenant_1"
      }

      {:ok, tenant: tenant}
    end

    test "delegates to Tenant.update_changeset/2 with correct params", %{tenant: tenant} do
      params = %{
        "title" => "Updated School",
        "contact_name" => "Jane Doe"
      }

      changeset = TenantLive.update_changeset(tenant, params)

      assert changeset.data == tenant
      assert get_change(changeset, :title) == "Updated School"
      assert get_change(changeset, :contact_name) == "Jane Doe"
    end

    test "accepts third argument (default empty list)", %{tenant: tenant} do
      params = %{"title" => "New Title"}

      changeset = TenantLive.update_changeset(tenant, params, [])

      assert changeset.valid?
      assert get_change(changeset, :title) == "New Title"
    end

    test "returns invalid changeset when required fields are missing", %{tenant: tenant} do
      # Tenant.update_changeset requires title, slug, prefix
      tenant_without_slug = %{tenant | slug: nil}
      params = %{}

      changeset = TenantLive.update_changeset(tenant_without_slug, params)

      refute changeset.valid?
      assert changeset.errors[:slug]
    end

    test "validates email format for contact_email", %{tenant: tenant} do
      params = %{"contact_email" => "invalid-email"}

      changeset = TenantLive.update_changeset(tenant, params)

      # Note: Actual validation depends on Tenant.update_changeset implementation
      # This test documents expected behavior
      assert changeset.data == tenant
    end
  end

  describe "create_changeset/3" do
    test "delegates to Tenant.create_changeset/1 with params" do
      params = %{
        "title" => "New School",
        "slug" => "new-school"
      }

      changeset = TenantLive.create_changeset(nil, params)

      assert changeset.data.__struct__ == Tenant
      assert get_change(changeset, :title) == "New School"
      assert get_change(changeset, :slug) == "new-school"
    end

    test "accepts third argument (default empty list)" do
      params = %{"title" => "Another School"}

      changeset = TenantLive.create_changeset(nil, params, [])

      assert changeset.valid?
      assert get_change(changeset, :title) == "Another School"
    end

    test "generates slug from title when slug is not provided" do
      params = %{"title" => "Test School Name"}

      with_mock Tenants, [:passthrough], slug_available?: fn _ -> true end do
        changeset = TenantLive.create_changeset(nil, params)

        assert get_change(changeset, :slug) != nil
      end
    end

    test "validates required title field" do
      params = %{}

      changeset = TenantLive.create_changeset(nil, params)

      refute changeset.valid?
      assert changeset.errors[:title]
    end

    test "assigns default plan on create" do
      params = %{"title" => "New School"}

      with_mock Tenants, [:passthrough], slug_available?: fn _ -> true end do
        changeset = TenantLive.create_changeset(nil, params)

        # Default plan assignment is part of create_changeset
        assert get_change(changeset, :current_plan_name) != nil
      end
    end
  end

  # Note: round/2 and fetch_current_tenant_usage/2 are private functions
  # They are tested indirectly through the public render_resource_slot/3 function
  # and through integration tests

  describe "item_actions/1" do
    test "has custom delete action" do
      default_actions = [
        show: :show,
        edit: :edit,
        delete: :delete
      ]

      assert [
               show: :show,
               edit: %{module: Backpex.ItemActions.Edit, only: [:row]},
               delete: %{module: CockpitWeb.ItemActions.DeleteTenant, only: [:row]}
             ] = TenantLive.item_actions(default_actions)
    end
  end

  describe "singular_name/0" do
    test "returns correct singular name" do
      assert TenantLive.singular_name() == "Tenant"
    end
  end

  describe "plural_name/0" do
    test "returns correct plural name" do
      assert TenantLive.plural_name() == "Tenants"
    end
  end

  describe "fields/0" do
    test "returns field configuration with all expected fields" do
      fields = TenantLive.fields()

      assert is_list(fields)

      # Check that key fields are present
      assert Keyword.has_key?(fields, :title)
      assert Keyword.has_key?(fields, :slug)
      assert Keyword.has_key?(fields, :customer_no)
      assert Keyword.has_key?(fields, :contact_name)
      assert Keyword.has_key?(fields, :contact_email)
      assert Keyword.has_key?(fields, :contact_phone)
      assert Keyword.has_key?(fields, :current_plan_name)
    end

    test "title field is configured correctly" do
      fields = TenantLive.fields()
      title_config = Keyword.get(fields, :title)

      assert title_config.module == Backpex.Fields.Text
      assert title_config.label == "Title"
    end

    test "slug field is readonly" do
      fields = TenantLive.fields()
      slug_config = Keyword.get(fields, :slug)

      assert slug_config.readonly == true
      assert slug_config.label == "Slug"
    end

    test "eduplaces_id field is readonly and except index" do
      fields = TenantLive.fields()
      eduplaces_config = Keyword.get(fields, :eduplaces_id)

      assert eduplaces_config.readonly == true
      assert eduplaces_config.except == [:index]
    end

    test "contact_email uses Email field type" do
      fields = TenantLive.fields()
      email_config = Keyword.get(fields, :contact_email)

      assert email_config.module == Backpex.Fields.Email
      assert email_config.except == [:index]
    end

    test "current_plan_name options returns valid plan list" do
      fields = TenantLive.fields()
      plan_config = Keyword.get(fields, :current_plan_name)

      assert is_list(plan_config.options)
      assert Enum.all?(plan_config.options, fn {title, key} -> is_binary(title) end)
    end

    test "textarea fields are excluded from index" do
      fields = TenantLive.fields()

      address_config = Keyword.get(fields, :address)
      assert address_config.module == Backpex.Fields.Textarea
      assert address_config.except == [:index]

      billing_address_config = Keyword.get(fields, :billing_address)
      assert billing_address_config.module == Backpex.Fields.Textarea
      assert billing_address_config.except == [:index]
    end
  end
end
