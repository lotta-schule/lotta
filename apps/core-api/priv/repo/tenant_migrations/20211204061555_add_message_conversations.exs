defmodule Lotta.Repo.Migrations.AddMessageConversations do
  use Ecto.Migration

  import Ecto.Query

  alias Ecto.Changeset
  alias Lotta.Repo
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Messages.Conversation

  def up do
    create table(:conversations, primary_key: false) do
      add(:id, :uuid,
        primary_key: true,
        default: fragment("public.gen_random_uuid()")
      )

      timestamps()
    end

    create table(:conversation_user, primary_key: false) do
      add(:conversation_id, references(:conversations, type: :uuid, on_delete: :delete_all),
        primary_key: true
      )

      add(:user_id, references(:users, on_delete: :delete_all), primary_key: true)
    end

    create table(:conversation_group, primary_key: false) do
      add(:conversation_id, references(:conversations, type: :uuid, on_delete: :delete_all),
        primary_key: true
      )

      add(:user_group_id, references(:user_groups, on_delete: :delete_all), primary_key: true)
    end

    create(index(:conversation_user, [:user_id]))
    create(index(:conversation_user, [:conversation_id]))
    create(index(:conversation_group, [:user_group_id]))
    create(index(:conversation_group, [:conversation_id]))

    alter table(:messages) do
      add(:conversation_id, references(:conversations, type: :uuid, on_delete: :delete_all))
    end

    create(index(:messages, [:conversation_id]))

    flush()

    from(m in "messages",
      select: %{
        id: m.id,
        sender_user_id: m.sender_user_id,
        recipient_user_id: m.recipient_user_id,
        recipient_group_id: m.recipient_group_id
      }
    )
    |> Repo.all(prefix: prefix())
    |> Enum.reduce([], fn message, available_conversations ->
      cond do
        is_nil(message[:sender_user_id]) ->
          raise "Message #{inspect(message)} is not valid as it has no sender"

        message[:recipient_user_id] ->
          # user <-> user message
          conversation =
            Enum.find(available_conversations, fn conv ->
              !is_nil(conv[:user_ids]) &&
                Enum.all?(
                  conv[:user_ids],
                  &(&1 == message[:recipient_user_id] || &1 == message[:sender_user_id])
                )
            end)

          if conversation do
            Repo.update_all(
              from("messages",
                where: [id: ^message[:id]]
              ),
              [set: [conversation_id: UUID.string_to_binary!(conversation[:id])]],
              prefix: prefix()
            )

            available_conversations
          else
            user_ids = [message[:recipient_user_id], message[:sender_user_id]]

            conversation =
              %Conversation{}
              |> Changeset.change()
              |> Changeset.put_assoc(
                :users,
                Repo.all(
                  from(
                    u in User,
                    where: u.id in ^user_ids
                  ),
                  prefix: prefix()
                )
              )
              |> Repo.insert!(prefix: prefix())

            Repo.update_all(
              from("messages",
                where: [id: ^message[:id]]
              ),
              [set: [conversation_id: UUID.string_to_binary!(conversation.id)]],
              prefix: prefix()
            )

            [
              %{id: conversation.id, user_ids: user_ids, obj: conversation}
              | available_conversations
            ]
          end

        message[:recipient_group_id] ->
          # user -> group message
          conversation =
            Enum.find(available_conversations, fn conv ->
              !is_nil(conv[:group_ids]) &&
                Enum.all?(
                  conv[:group_ids],
                  &(&1 == message[:recipient_group_id])
                )
            end)

          if conversation do
            Repo.update_all(
              from("messages",
                where: [id: ^message[:id]]
              ),
              [set: [conversation_id: UUID.string_to_binary!(conversation.id)]],
              prefix: prefix()
            )

            available_conversations
          else
            group_ids = [message[:recipient_group_id]]

            conversation =
              %Conversation{}
              |> Changeset.change()
              |> Changeset.put_assoc(
                :groups,
                Repo.all(
                  from(
                    ug in UserGroup,
                    where: ug.id in ^group_ids
                  ),
                  prefix: prefix()
                )
              )
              |> Repo.insert!(prefix: prefix())

            Repo.update_all(
              from("messages",
                where: [id: ^message[:id]]
              ),
              [set: [conversation_id: UUID.string_to_binary!(conversation.id)]],
              prefix: prefix()
            )

            [
              %{id: conversation.id, group_ids: group_ids, obj: conversation}
              | available_conversations
            ]
          end

        true ->
          raise "NotImplemented"
      end
    end)

    flush()

    rename(table(:messages), :sender_user_id, to: :user_id)

    alter table(:messages) do
      remove(:recipient_user_id)
      remove(:recipient_group_id)
    end

    flush()

    Conversation
    |> Repo.all(prefix: prefix())
    |> Enum.each(fn conversation ->
      inserted_at =
        Repo.all(
          from("messages",
            where: [conversation_id: ^UUID.string_to_binary!(conversation.id)],
            select: [:inserted_at],
            order_by: {:asc, :inserted_at},
            limit: 1
          ),
          prefix: prefix()
        )

      inserted_at =
        if Kernel.match?([%{inserted_at: _}], inserted_at) do
          inserted_at
          |> List.first()
          |> Map.get(:inserted_at)
        end

      updated_at =
        Repo.all(
          from("messages",
            where: [conversation_id: ^UUID.string_to_binary!(conversation.id)],
            select: [:updated_at],
            order_by: {:desc, :updated_at},
            limit: 1
          ),
          prefix: prefix()
        )

      updated_at =
        if Kernel.match?([%{updated_at: _}], updated_at) do
          updated_at
          |> List.first()
          |> Map.get(:updated_at)
        end

      Repo.update_all(
        from(c in Conversation, where: c.id == ^conversation.id),
        [set: [inserted_at: inserted_at, updated_at: updated_at]],
        prefix: prefix()
      )
    end)
  end

  def down do
    alter table(:messages) do
      add(:recipient_user_id, references(:users))
      add(:recipient_group_id, references(:user_groups))
    end

    rename(table(:messages), :user_id, to: :sender_user_id)

    flush()

    Enum.each(
      Repo.all(Conversation, prefix: prefix()),
      fn conversation ->
        conversation = Repo.preload(conversation, [:groups, :users])

        messages =
          from(m in "messages",
            where: m.conversation_id == ^UUID.string_to_binary!(conversation.id),
            select: %{
              id: m.id,
              sender_user_id: m.sender_user_id,
              recipient_user_id: m.recipient_user_id,
              recipient_group_id: m.recipient_group_id
            }
          )
          |> Repo.all(prefix: prefix())

        recipient_group_id =
          if Enum.any?(conversation.groups), do: List.first(conversation.groups).id

        Enum.each(messages, fn message ->
          sender_user_id = message.sender_user_id

          recipient_user_id =
            Enum.find_value(conversation.users, fn conv_user ->
              if conv_user.id != sender_user_id, do: conv_user.id
            end)

          Repo.update_all(
            from("messages",
              where: [id: ^message.id]
            ),
            [
              set: [
                sender_user_id: sender_user_id,
                recipient_user_id: recipient_user_id,
                recipient_group_id: recipient_group_id
              ]
            ],
            prefix: prefix()
          )
        end)
      end
    )

    alter table(:messages) do
      remove(:conversation_id)
    end

    drop(table(:conversation_user))
    drop(table(:conversation_group))
    drop(table(:conversations))
  end
end
