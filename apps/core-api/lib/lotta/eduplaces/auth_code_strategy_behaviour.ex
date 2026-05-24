defmodule Lotta.Eduplaces.AuthCodeStrategyBehaviour do
  alias Lotta.Eduplaces.UserInfo

  @callback authorize_url!(keyword()) :: String.t()
  @callback get_token!(map() | keyword()) :: {any(), UserInfo.t()}
end
