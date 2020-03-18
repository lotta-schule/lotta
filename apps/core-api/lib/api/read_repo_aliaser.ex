defmodule Api.ReadRepoAliaser do
  defmacro __using__(_) do
    conf = Application.fetch_env(:api, Api.ReadRepo)
    case conf do
      :error ->
        quote do
          alias Api.Repo, as: ReadRepo
        end
      _ ->
        quote do
          alias Api.ReadRepo
        end
    end
  end
end