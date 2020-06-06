defmodule Api.Elasticsearch.Cluster do
  use Elasticsearch.Cluster, otp_app: :api

  def init(config) do
    {_, config} =
      get_and_update_in(
        config,
        [:indexes, :articles, :settings],
        &{&1, Application.app_dir(:api, &1)}
      )

    {:ok, config}
  end
end
