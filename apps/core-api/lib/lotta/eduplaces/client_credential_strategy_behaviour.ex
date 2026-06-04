defmodule Lotta.Eduplaces.ClientCredentialStrategyBehaviour do
  @moduledoc false
  @callback client() :: OAuth2.Client.t()
end
