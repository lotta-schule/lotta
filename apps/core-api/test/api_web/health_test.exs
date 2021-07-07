defmodule LottaWeb.SitemapTest do
  @moduledoc false

  use LottaWeb.ConnCase

  describe "health" do
    test "returns an OK response from health endpoint" do
      build_conn()
      |> get("/_debug/health")
      |> response(200)
    end
  end
end
