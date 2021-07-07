defmodule LottaWeb.EmailViewTest do
  @moduledoc false

  use Lotta.DataCase

  alias Lotta.{Repo, Tenants}
  alias Lotta.Storage.File
  alias LottaWeb.EmailView

  @prefix "tenant_test"

  setup do
    # Repo.put_prefix(@prefix)
    {:ok, %{tenant: Tenants.get_tenant_by_prefix(@prefix)}}
  end

  describe "email_view theme_prop/2" do
    test "should return a valid known property", %{tenant: t} do
      assert EmailView.theme_prop(t, "palette.primary.main", "yellow") == "red"
    end

    test "should return the callback for invalid path", %{tenant: t} do
      assert EmailView.theme_prop(t, "unknown.glibber.ish", "violet") == "violet"
    end
  end

  describe "email_view logo_url/0" do
    test "should return a data url if no logo is set", %{tenant: t} do
      assert String.starts_with?(EmailView.logo_url(t), "data:image/png")
    end

    test "should return its url if a file is set as logo", %{tenant: t} do
      file =
        Repo.one!(
          from(f in File,
            where: f.filename == "logo1.jpg"
          ),
          prefix: t.prefix
        )

      config =
        Map.put(
          Tenants.get_configuration(t),
          :logo_image_file,
          file
        )

      {:ok, tenant} = Tenants.update_configuration(t, config)
      assert EmailView.logo_url(tenant) =~ ~r/http:\/\/(minio|localhost|127\.0\.0\.1)/
    end
  end
end
