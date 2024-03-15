defmodule Lotta.Repo.TenantMigrations.ChangeFeedbackContentToText do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:feedbacks) do
      modify :content, :text
      modify :metadata, :text
    end
  end
end
