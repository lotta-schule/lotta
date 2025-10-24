defmodule LottaWeb.SubscriptionCase do
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
      @endpoint LottaWeb.Endpoint

      use Absinthe.Phoenix.SubscriptionTest,
        schema: LottaWeb.Schema

      use LottaWeb.ConnCase
    end
  end
end
