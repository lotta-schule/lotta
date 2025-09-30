defmodule LottaWeb.Schema.Accounts.UserGroup do
  @moduledoc false

  use Absinthe.Schema.Notation

  input_object :select_user_group_input do
    field(:id, non_null(:id))
  end

  input_object :user_group_input do
    field(:name, non_null(:string))
    field(:sort_key, :integer)
    field(:enrollment_tokens, list_of(non_null(:string)))
    field(:is_admin_group, :boolean)
    field(:can_read_full_name, :boolean)
  end

  object :user_group do
    field(:id, non_null(:id))
    field(:inserted_at, non_null(:datetime))
    field(:updated_at, non_null(:datetime))
    field(:name, non_null(:string))
    field(:sort_key, non_null(:integer))
    field(:is_admin_group, non_null(:boolean))
    field(:can_read_full_name, non_null(:boolean))
    field(:eduplacesId, :string)

    field(:enrollment_tokens, non_null(list_of(non_null(:string))),
      resolve: &LottaWeb.UserGroupResolver.resolve_enrollment_tokens/3
    )
  end

  object :delete_user_group_result do
    field(:user_group, non_null(:user_group))
    field(:unpublished_articles, non_null(list_of(non_null(:article))))
  end
end
