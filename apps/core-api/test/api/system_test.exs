defmodule Api.SystemTest do
  @moduledoc false

  use Api.DataCase, async: true
  alias Api.System

  setup do
    Repo.Seeder.seed()
  end

  describe "System domains" do
    test "get_main_url should return custom url set as main_domain" do
      assert System.get_main_url() == "https://lotta.web"
    end

    test "get_main_url should return custom url without protocol when option :skip_protocol is set" do
      assert System.get_main_url(skip_protocol: true) == "lotta.web"
    end
  end
end
