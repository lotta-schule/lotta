defmodule Api.Repo.Migrations.ChangeMessagingContentFromStringToText do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      modify :content, :text,
        from: :string
    end
  end
end
