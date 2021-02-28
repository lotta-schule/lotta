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

  describe "get_user_max_storage/0" do
    test "should return -1 if none is set" do
      assert System.get_user_max_storage() == -1
    end

    test "should return the configured limit in bytes" do
      Api.System.get_configuration()
      |> Api.System.put_configuration("user_max_storage_config", "87")

      assert System.get_user_max_storage() == 91226112
    end
  end
end
