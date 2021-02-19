defmodule ApiWeb.SubscriptionCase do
  @moduledoc """
  This module defines the test case to be used by
  subscription tests
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      # Import conveniences for testing with channels
      import Phoenix.ChannelTest
      # The default endpoint for testing
      @endpoint ApiWeb.Endpoint

      use Absinthe.Phoenix.SubscriptionTest,
        schema: ApiWeb.Schema

      use ApiWeb.ConnCase, async: true
    end
  end
end
