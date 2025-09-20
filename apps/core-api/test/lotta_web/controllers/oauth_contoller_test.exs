defmodule LottaWeb.OauthContollerTest do
  @moduledoc false

  use LottaWeb.ConnCase

  setup do
    Tesla.Mock.mock(fn
      %{url: "https://plausible.io/" <> _rest} = env ->
        %Tesla.Env{env | status: 200, body: "OK"}
      env ->
        %Tesla.Env{env | status: 200, body: "OK"} # fallback if you want, or raise for unexpected
    end)
    :ok
  end

  describe "oauth" do
    test "placeholder test" do
      # This is a placeholder test to ensure the file is valid
      # Add actual OAuth tests here as needed
      assert true
    end
  end
end