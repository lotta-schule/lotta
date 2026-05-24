defmodule Lotta.Eduplaces.ClientCredentialStrategyBehaviour do
  @callback client() :: OAuth2.Client.t()
end
