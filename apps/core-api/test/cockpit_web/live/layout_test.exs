defmodule CockpitWeb.Live.LayoutTest do
  @moduledoc false

  use CockpitWeb.ConnCase, async: false

  setup %{conn: conn}, do: {:ok, conn: authenticate(conn)}

  for path <- ["/", "/invoices"] do
    test "renders the backpex preferences root on #{path}", %{conn: conn} do
      html = conn |> get(unquote(path)) |> html_response(200)

      assert html =~ ~s(id="backpex-preferences")
      assert html =~ ~s(data-preferences-path="/backpex_preferences")
    end
  end
end
