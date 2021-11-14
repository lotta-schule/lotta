defmodule Lotta.SentryFilter do
  @behaviour Sentry.EventFilter

  def exclude_exception?(%Elixir.Phoenix.Router.NoRouteError{}, :plug), do: true
  def exclude_exception?(_exception, _source), do: false
end
