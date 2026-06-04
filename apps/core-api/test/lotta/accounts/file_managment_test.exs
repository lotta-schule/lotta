defmodule Lotta.Accounts.FileManagmentTest do
  @moduledoc false

  use Lotta.DataCase, async: true

  import Lotta.Factory

  alias Lotta.Accounts.FileManagment

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)

    user = insert(:user)
    user_dir = insert(:directory, user_id: user.id)

    insert(:file, user_id: user.id, parent_directory_id: user_dir.id, filesize: 1000)
    insert(:file, user_id: user.id, parent_directory_id: user_dir.id, filesize: 2000)
    # file in a public directory should NOT count
    public_dir = insert(:directory)
    insert(:file, user_id: user.id, parent_directory_id: public_dir.id, filesize: 9999)

    {:ok, %{user: user}}
  end

  describe "total_user_files_size/1" do
    test "should return the correct size of total files for a user", %{user: user} do
      assert FileManagment.total_user_files_size(user) == 3000
    end
  end
end
