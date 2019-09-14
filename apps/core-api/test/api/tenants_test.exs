defmodule Api.TenantsTest do
  use Api.DataCase

  alias Api.Tenants

  describe "tenants" do
    alias Api.Tenants.Tenant

    @valid_attrs %{slug: "some slug", title: "some title"}
    @update_attrs %{slug: "some updated slug", title: "some updated title"}
    @invalid_attrs %{slug: nil, title: nil}

    def tenant_fixture(attrs \\ %{}) do
      {:ok, tenant} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Tenants.create_tenant()

      tenant
    end

    test "list_tenants/0 returns all tenants" do
      tenant = tenant_fixture()
      assert Tenants.list_tenants() == [tenant]
    end

    test "get_tenant!/1 returns the tenant with given id" do
      tenant = tenant_fixture()
      assert Tenants.get_tenant!(tenant.id) == tenant
    end

    test "create_tenant/1 with valid data creates a tenant" do
      assert {:ok, %Tenant{} = tenant} = Tenants.create_tenant(@valid_attrs)
      assert tenant.slug == "some slug"
      assert tenant.title == "some title"
    end

    test "create_tenant/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Tenants.create_tenant(@invalid_attrs)
    end

    test "update_tenant/2 with valid data updates the tenant" do
      tenant = tenant_fixture()
      assert {:ok, %Tenant{} = tenant} = Tenants.update_tenant(tenant, @update_attrs)
      assert tenant.slug == "some updated slug"
      assert tenant.title == "some updated title"
    end

    test "update_tenant/2 with invalid data returns error changeset" do
      tenant = tenant_fixture()
      assert {:error, %Ecto.Changeset{}} = Tenants.update_tenant(tenant, @invalid_attrs)
      assert tenant == Tenants.get_tenant!(tenant.id)
    end

    test "delete_tenant/1 deletes the tenant" do
      tenant = tenant_fixture()
      assert {:ok, %Tenant{}} = Tenants.delete_tenant(tenant)
      assert_raise Ecto.NoResultsError, fn -> Tenants.get_tenant!(tenant.id) end
    end

    test "change_tenant/1 returns a tenant changeset" do
      tenant = tenant_fixture()
      assert %Ecto.Changeset{} = Tenants.change_tenant(tenant)
    end
  end

  describe "categories" do
    alias Api.Tenants.Category

    @valid_attrs %{title: "some title"}
    @update_attrs %{title: "some updated title"}
    @invalid_attrs %{title: nil}

    def category_fixture(attrs \\ %{}) do
      {:ok, category} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Tenants.create_category()

      category
    end

    test "list_categories/0 returns all categories" do
      category = category_fixture()
      assert Tenants.list_categories() == [category]
    end

    test "get_category!/1 returns the category with given id" do
      category = category_fixture()
      assert Tenants.get_category!(category.id) == category
    end

    test "create_category/1 with valid data creates a category" do
      assert {:ok, %Category{} = category} = Tenants.create_category(@valid_attrs)
      assert category.title == "some title"
    end

    test "create_category/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Tenants.create_category(@invalid_attrs)
    end

    test "update_category/2 with valid data updates the category" do
      category = category_fixture()
      assert {:ok, %Category{} = category} = Tenants.update_category(category, @update_attrs)
      assert category.title == "some updated title"
    end

    test "update_category/2 with invalid data returns error changeset" do
      category = category_fixture()
      assert {:error, %Ecto.Changeset{}} = Tenants.update_category(category, @invalid_attrs)
      assert category == Tenants.get_category!(category.id)
    end

    test "delete_category/1 deletes the category" do
      category = category_fixture()
      assert {:ok, %Category{}} = Tenants.delete_category(category)
      assert_raise Ecto.NoResultsError, fn -> Tenants.get_category!(category.id) end
    end

    test "change_category/1 returns a category changeset" do
      category = category_fixture()
      assert %Ecto.Changeset{} = Tenants.change_category(category)
    end
  end

  describe "widgets" do
    alias Api.Tenants.Widget

    @valid_attrs %{configuration: %{}, title: "some title", type: "some type"}
    @update_attrs %{configuration: %{}, title: "some updated title", type: "some updated type"}
    @invalid_attrs %{configuration: nil, title: nil, type: nil}

    def widget_fixture(attrs \\ %{}) do
      {:ok, widget} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Tenants.create_widget()

      widget
    end

    test "list_widgets/0 returns all widgets" do
      widget = widget_fixture()
      assert Tenants.list_widgets() == [widget]
    end

    test "get_widget!/1 returns the widget with given id" do
      widget = widget_fixture()
      assert Tenants.get_widget!(widget.id) == widget
    end

    test "create_widget/1 with valid data creates a widget" do
      assert {:ok, %Widget{} = widget} = Tenants.create_widget(@valid_attrs)
      assert widget.configuration == %{}
      assert widget.title == "some title"
      assert widget.type == "some type"
    end

    test "create_widget/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Tenants.create_widget(@invalid_attrs)
    end

    test "update_widget/2 with valid data updates the widget" do
      widget = widget_fixture()
      assert {:ok, %Widget{} = widget} = Tenants.update_widget(widget, @update_attrs)
      assert widget.configuration == %{}
      assert widget.title == "some updated title"
      assert widget.type == "some updated type"
    end

    test "update_widget/2 with invalid data returns error changeset" do
      widget = widget_fixture()
      assert {:error, %Ecto.Changeset{}} = Tenants.update_widget(widget, @invalid_attrs)
      assert widget == Tenants.get_widget!(widget.id)
    end

    test "delete_widget/1 deletes the widget" do
      widget = widget_fixture()
      assert {:ok, %Widget{}} = Tenants.delete_widget(widget)
      assert_raise Ecto.NoResultsError, fn -> Tenants.get_widget!(widget.id) end
    end

    test "change_widget/1 returns a widget changeset" do
      widget = widget_fixture()
      assert %Ecto.Changeset{} = Tenants.change_widget(widget)
    end
  end
end
