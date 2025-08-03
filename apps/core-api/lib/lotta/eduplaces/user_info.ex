defmodule Lotta.Eduplaces.UserInfo do
  @moduledoc """
  Represents information about a Eduplaces user retrieved from Eduplaces.
  """
  alias Lotta.Eduplaces.{GroupInfo, SchoolInfo}

  defstruct [:username, :groups, :role, :school]

  @type t :: %__MODULE__{
          username: String.t(),
          groups: [GroupInfo.t()],
          role: :student | :teacher | :other,
          school: SchoolInfo.t()
        }

  def from_jwt_info(
        %{
          "pseudonym" => username,
          "groups" => raw_groups,
          "role" => role
        } = jwt_info
      ) do
    %__MODULE__{
      username: username,
      groups: Enum.map(raw_groups, &GroupInfo.from_jwt_info/1),
      role:
        case String.downcase(role) do
          "student" -> :student
          "teacher" -> :teacher
          "other" -> :other
          _ -> raise ArgumentError, "Invalid role: #{role}"
        end,
      school: SchoolInfo.from_jwt_info(jwt_info)
    }
  end
end
