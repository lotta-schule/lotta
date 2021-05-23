defmodule ApiWeb.EmailViewTest do
  @moduledoc false

  use Api.DataCase

  alias Api.Repo
  alias Api.System
  alias Api.Storage.File
  alias ApiWeb.EmailView

  describe "email_view theme_prop/2" do
    test "should return a valid known property" do
      assert EmailView.theme_prop("palette.primary.main", "yellow") == "red"
    end

    test "should return the callback for invalid path" do
      assert EmailView.theme_prop("unknown.glibber.ish", "violet") == "violet"
    end
  end

  describe "email_view title/0" do
    test "should return the title" do
      assert EmailView.title() == "Lotta"
    end
  end

  describe "email_view logo_url/0" do
    test "should return a data url if no logo is set" do
      assert String.starts_with?(EmailView.logo_url(), "data:image/png")
    end

    test "should return its url if a file is set as logo" do
      file =
        from(f in File,
          where: f.filename == "logo1.jpg"
        )
        |> Repo.one!()

      System.get_configuration()
      |> System.put_configuration(:logo_image_file, file)

      assert EmailView.logo_url() =~ ~r/http:\/\/minio/
    end
  end
end
