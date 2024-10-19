defmodule LottaWeb.Schema.Middleware.EnsureUserIsHisec do
  @moduledoc false

  @behaviour Absinthe.Middleware

  @doc false
  def call(
        %{context: %{current_user: %{id: _id, access_level: "hisec"}}} = resolution,
        _config
      ),
      do: resolution

  def call(resolution, _config) do
    resolution
    |> Absinthe.Resolution.put_result(
      {:error, "Du musst die Anfrage gesondert bestätigen, um das zu tun."}
    )
  end
end
