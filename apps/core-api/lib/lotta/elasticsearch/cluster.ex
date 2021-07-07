defmodule Lotta.Elasticsearch.Cluster do
  @moduledoc false

  use Elasticsearch.Cluster, otp_app: :lotta

  def init(config) do
    # replace json files with correct app_dir path
    {_, config} =
      get_and_update_in(
        config,
        [:indexes, :articles, :settings],
        &{&1, Application.app_dir(:lotta, &1)}
      )

    {:ok, config}
  end
end
