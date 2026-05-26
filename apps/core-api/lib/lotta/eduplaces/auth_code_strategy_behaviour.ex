defmodule Lotta.Eduplaces.AuthCodeStrategyBehaviour do
  @moduledoc false
  alias Lotta.Eduplaces.UserInfo

  @callback authorize_url!(keyword()) :: String.t()
  @callback get_token!(map() | keyword()) :: {any(), UserInfo.t()}
end
