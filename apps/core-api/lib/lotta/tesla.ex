defmodule Lotta.Tesla do
  @moduledoc """
  Generic Tesla client with sane defaults
  """

  @spec create_client(additional_middlewares :: list(module() | {module(), any()})) ::
          Tesla.Client.t()
  def create_client(additional_middlewares \\ []) do
    Tesla.client(base_middleware() ++ additional_middlewares)
  end

  def base_middleware() do
    [
      Tesla.Middleware.OpenTelemetry,
      Tesla.Middleware.FollowRedirects,
      {Tesla.Middleware.Logger, level: &get_log_level/1}
    ]
  end

  @spec get_log_level(env :: {:ok, Tesla.Env.t()} | {:error, String.t()}) :: atom()
  defp get_log_level({:error, _reason}), do: :error
  defp get_log_level({:ok, %Tesla.Env{status: status}}) when status <= 399, do: :debug
  defp get_log_level({:ok, %Tesla.Env{status: status}}) when status in 400..499, do: :warning
  defp get_log_level(_), do: :error
end
