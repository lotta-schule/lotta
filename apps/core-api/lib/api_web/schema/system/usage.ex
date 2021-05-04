defmodule ApiWeb.Schema.System.Usage do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :usage do
    field :period_start, :datetime
    field :period_end, :datetime
    field :storage, :storage_usage
    field :media, :media_usage
  end

  object :storage_usage do
    field :used_total, :integer
    field :files_total, :integer
  end

  object :media_usage do
    field :media_files_total, :integer
    field :media_files_total_duration, :float
    field :media_conversion_current_period, :float
  end
end
