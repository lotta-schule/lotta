defmodule LottaWeb.CoreComponentsTest do
  @moduledoc false

  use LottaWeb.ConnCase, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component
  import LottaWeb.CoreComponents

  alias Phoenix.LiveView.JS

  describe "button/1" do
    test "renders basic button" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.button>Send!</.button>
        """)

      assert html =~ ~s|class="btn btn-primary btn-soft"|
      assert html =~ "Send!"
    end

    test "renders button with primary variant" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.button variant="primary">Send!</.button>
        """)

      assert html =~ ~s|class="btn btn-primary"|
      assert html =~ "Send!"
    end

    test "renders button with custom class" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.button class="custom-class">Send!</.button>
        """)

      assert html =~ ~s|class="custom-class"|
      assert html =~ "Send!"
    end

    test "renders button with phx-click" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.button phx-click="go">Send!</.button>
        """)

      assert html =~ ~s|phx-click="go"|
      assert html =~ "Send!"
    end

    test "renders link button with navigate" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.button navigate="/home">Home</.button>
        """)

      assert html =~ ~s|data-phx-link="redirect"|
      assert html =~ ~s|href="/home"|
      assert html =~ "Home"
    end

    test "renders disabled button" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.button disabled>Disabled</.button>
        """)

      assert html =~ ~s|disabled|
      assert html =~ "Disabled"
    end
  end

  describe "input/1" do
    test "renders basic text input" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.input name="username" value="" />
        """)

      assert html =~ ~s|type="text"|
      assert html =~ ~s|name="username"|
      assert html =~ ~s|class="w-full input"|
    end

    test "renders input with label" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.input name="username" label="Username" value="" />
        """)

      assert html =~ ~s|<span class="label mb-1">Username</span>|
      assert html =~ ~s|name="username"|
    end

    test "renders input with value" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.input name="username" value="john_doe" />
        """)

      assert html =~ ~s|value="john_doe"|
    end

    test "renders input with custom class" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.input name="username" class="custom-input" value="" />
        """)

      assert html =~ ~s|class="custom-input"|
    end

    test "renders input with errors" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.input name="username" errors={["can't be blank"]} value="" />
        """)

      assert html =~ ~s|class="w-full input input-error"|
    end

    test "renders checkbox input" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.input type="checkbox" name="agree" label="I agree" />
        """)

      assert html =~ ~s|type="checkbox"|
      assert html =~ ~s|name="agree"|
      assert html =~ ~s|value="true"|
      assert html =~ ~s|class="checkbox checkbox-sm"|
      assert html =~ "I agree"
      assert html =~ ~s|<input type="hidden" name="agree" value="false"|
    end

    test "renders checked checkbox input" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.input type="checkbox" name="agree" checked={true} />
        """)

      assert html =~ ~s|checked|
    end

    test "renders select input" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.input type="select" name="role" options={[{"Admin", "admin"}, {"User", "user"}]} value="" />
        """)

      assert html =~ ~s|<select|
      assert html =~ ~s|name="role"|
      assert html =~ ~s|class="w-full select"|
      assert html =~ ~s|<option value="admin">Admin</option>|
      assert html =~ ~s|<option value="user">User</option>|
    end

    test "renders select input with prompt" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.input type="select" name="role" prompt="Choose role" options={[{"Admin", "admin"}]} value="" />
        """)

      assert html =~ ~s|<option value="">Choose role</option>|
    end

    test "renders textarea input" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.input type="textarea" name="description" value="" />
        """)

      assert html =~ ~s|<textarea|
      assert html =~ ~s|name="description"|
      assert html =~ ~s|class="w-full textarea"|
    end

    test "renders input with form field" do
      form = to_form(%{"username" => "john"}, as: :user)
      assigns = %{form: form}

      html =
        rendered_to_string(~H"""
        <.input field={@form[:username]} />
        """)

      assert html =~ ~s|name="user[username]"|
      assert html =~ ~s|value="john"|
    end
  end

  describe "header/1" do
    test "renders basic header" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.header>Page Title</.header>
        """)

      assert html =~ ~s|class="text-lg font-semibold leading-8"|
      assert html =~ "Page Title"
      assert html =~ ~s|class="pb-4"|
    end

    test "renders header with subtitle" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.header>
          Page Title
          <:subtitle>This is a subtitle</:subtitle>
        </.header>
        """)

      assert html =~ "Page Title"
      assert html =~ ~s|class="text-sm text-base-content/70"|
      assert html =~ "This is a subtitle"
    end

    test "renders header with actions" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.header>
          Page Title
          <:actions>
            <button>Action</button>
          </:actions>
        </.header>
        """)

      assert html =~ "Page Title"
      assert html =~ ~s|class="flex-none"|
      assert html =~ "<button>Action</button>"
      assert html =~ ~s|class="flex items-center justify-between gap-6 pb-4"|
    end
  end

  describe "table/1" do
    test "renders basic table" do
      users = [%{id: 1, name: "John"}, %{id: 2, name: "Jane"}]
      assigns = %{users: users}

      html =
        rendered_to_string(~H"""
        <.table id="users" rows={@users}>
          <:col :let={user} label="ID">{user.id}</:col>
          <:col :let={user} label="Name">{user.name}</:col>
        </.table>
        """)

      assert html =~ ~s|class="table table-zebra"|
      assert html =~ ~s|<th>ID</th>|
      assert html =~ ~s|<th>Name</th>|
      assert html =~ ~s|id="users"|
      assert html =~ "1"
      assert html =~ "John"
      assert html =~ "2"
      assert html =~ "Jane"
    end

    test "renders table with actions" do
      users = [%{id: 1, name: "John"}]
      assigns = %{users: users}

      html =
        rendered_to_string(~H"""
        <.table id="users" rows={@users}>
          <:col :let={user} label="Name">{user.name}</:col>
          <:action :let={user}>
            <button>Edit {user.name}</button>
          </:action>
        </.table>
        """)

      assert html =~ ~s|<span class="sr-only">Actions</span>|
      assert html =~ ~s|class="w-0 font-semibold"|
      assert html =~ "Edit John"
    end

    test "renders empty table" do
      users = []
      assigns = %{users: users}

      html =
        rendered_to_string(~H"""
        <.table id="users" rows={@users}>
          <:col :let={user} label="Name">{user.name}</:col>
        </.table>
        """)

      assert html =~ ~s|class="table table-zebra"|
      assert html =~ ~s|id="users"|
      # Table should still have header row
      assert html =~ ~s|<th>Name</th>|
    end
  end

  describe "list/1" do
    test "renders basic list" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.list>
          <:item title="First Item">Content 1</:item>
          <:item title="Second Item">Content 2</:item>
        </.list>
        """)

      assert html =~ ~s|class="list"|
      assert html =~ ~s|class="list-row"|
      assert html =~ ~s|class="list-col-grow"|
      assert html =~ ~s|class="font-bold"|
      assert html =~ "First Item"
      assert html =~ "Content 1"
      assert html =~ "Second Item"
      assert html =~ "Content 2"
    end
  end

  describe "show/2 and hide/2" do
    test "creates show JS command without initial JS" do
      js_command = show("#modal")

      assert %JS{} = js_command
      assert js_command.ops != []
    end

    test "creates hide JS command without initial JS" do
      js_command = hide("#modal")

      assert %JS{} = js_command
      assert js_command.ops != []
    end

    test "chains show JS command" do
      initial_js = %JS{ops: []}
      js_command = show(initial_js, "#modal")

      assert %JS{} = js_command
      assert length(js_command.ops) >= 1
    end

    test "chains hide JS command" do
      initial_js = %JS{ops: []}
      js_command = hide(initial_js, "#modal")

      assert %JS{} = js_command
      assert length(js_command.ops) >= 1
    end
  end

  describe "translate_error/1" do
    test "translates simple error message" do
      error = {"can't be blank", []}
      result = translate_error(error)

      assert is_binary(result)
      # The result could be translated, so we just check it's a string
      assert String.length(result) > 0
    end

    test "translates error message with options" do
      error = {"should be at least %{count} character(s)", [count: 1]}
      result = translate_error(error)

      assert is_binary(result)
      assert String.length(result) > 0
    end
  end

  describe "translate_errors/2" do
    test "translates errors for a specific field" do
      errors = [
        {:email, {"can't be blank", []}},
        {:username, {"is too short", []}},
        {:email, {"has invalid format", []}}
      ]

      result = translate_errors(errors, :email)

      assert is_list(result)
      assert length(result) == 2
      # Check that we got some translated strings
      assert Enum.all?(result, &is_binary/1)
    end

    test "returns empty list for field with no errors" do
      errors = [
        {:email, {"can't be blank", []}},
        {:username, {"is too short", []}}
      ]

      result = translate_errors(errors, :password)

      assert result == []
    end

    test "handles empty error list" do
      result = translate_errors([], :email)

      assert result == []
    end
  end
end
