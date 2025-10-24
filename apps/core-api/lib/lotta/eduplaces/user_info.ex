defmodule Lotta.Eduplaces.UserInfo do
  @moduledoc """
  Represents information about a Eduplaces user retrieved from Eduplaces.
  """
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Eduplaces.{GroupInfo, SchoolInfo}

  defstruct id: nil, username: nil, name: nil, groups: [], role: nil, school: nil

  @type t :: %__MODULE__{
          id: String.t(),
          username: String.t(),
          name: String.t(),
          groups: [GroupInfo.t()],
          role: :student | :teacher | :other,
          school: SchoolInfo.t()
        }

  def from_jwt_info(
        %{
          "sub" => id,
          "pseudonym" => username,
          "groups" => raw_groups,
          "role" => role
        } = jwt_info
      ) do
    %__MODULE__{
      id: id,
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

  def from_idm_details(%{"id" => id} = details) do
    %__MODULE__{
      id: id,
      username: details["pseudonym"],
      groups:
        (details["groups"] || [])
        |> Enum.map(&GroupInfo.from_idm_details/1),
      role:
        case String.downcase(details["role"]) do
          "student" -> :student
          "teacher" -> :teacher
          _ -> :other
        end,
      name:
        case details["name"] do
          %{"firstCall" => _, "firstFull" => first_full, "last" => last} ->
            "#{first_full} #{last}"

          _ ->
            nil
        end
    }
  end

  @doc """
  Converts a Eduplaces user info struct to a format suitable for Lotta user representation.
  """
  @doc since: "6.1.0"
  @spec to_lotta_user(t(), [{:groups, UserGroup.t()} | {}]) :: User.t()
  def to_lotta_user(%__MODULE__{} = user_info, opts \\ []) do
    %User{
      nickname: user_info.username,
      name: user_info.name,
      groups: Keyword.get(opts, :groups, []),
      eduplaces_id: user_info.id
    }
  end
end
