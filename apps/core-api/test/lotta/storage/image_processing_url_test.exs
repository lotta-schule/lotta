defmodule Lotta.ImageProcessingUrlTest do
  @moduledoc false

  use Lotta.DataCase, async: false

  import Mock

  alias Lotta.Storage.ImageProcessingUrl

  describe "ImageProcessingUrl" do
    test "get_url/1 should return the original url if no processing params have been passed" do
      url = ImageProcessingUrl.get_url("http://ugc.lotta.schule/abc875aaj42h", %{})
      assert "http://ugc.lotta.schule/abc875aaj42h" = url
    end

    test "get_url/1 should return the url with correct options" do
      url =
        ImageProcessingUrl.get_url("http://ugc.lotta.schule/abc875aaj42h", %{
          width: 500,
          height: 400,
          fn: "contain",
          format: "webp"
        })

      assert "http://ugc.lotta.schule/abc875aaj42h?metadata=1&format=webp&fit=contain&height=400&width=500" =
               url
    end

    test "get_url/1 should return the original url when host is not registered" do
      url =
        ImageProcessingUrl.get_url("http://something.lotta.schule/abc875aaj42h", %{
          width: 500,
          height: 400,
          fn: :fit
        })

      assert "http://something.lotta.schule/abc875aaj42h" = url
    end
  end
end
