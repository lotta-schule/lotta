defmodule Lotta.Tenants.TenantDbManager do
  @moduledoc """
  Utilities that help with managing tenant's prefixed databases.
  """

  alias Lotta.Repo
  alias Ecto.Migration.SchemaMigration
  alias Lotta.Tenants.Tenant

  @migrations [
    {20_190_523_113_923, Lotta.Repo.TenantMigrations.CreateUsers},
    {20_190_523_115_155, Lotta.Repo.TenantMigrations.CreateArticles},
    {20_190_523_145_657, Lotta.Repo.TenantMigrations.AddPasswordHash},
    {20_190_527_144_741, Lotta.Repo.TenantMigrations.CreateTenants},
    {20_190_529_223_707, Lotta.Repo.TenantMigrations.CreateCategories},
    {20_190_530_082_941, Lotta.Repo.TenantMigrations.AddTenantIdToCategory},
    {20_190_530_100_535, Lotta.Repo.TenantMigrations.AddTenantIdToArticles},
    {20_190_615_141_426, Lotta.Repo.TenantMigrations.CreateContentModules},
    {20_190_621_220_836, Lotta.Repo.TenantMigrations.AddSortKeyToContentModule},
    {20_190_707_202_512, Lotta.Repo.TenantMigrations.CreateFiles},
    {20_190_714_093_933, Lotta.Repo.TenantMigrations.AddNicknameToUser},
    {20_190_716_183_344, Lotta.Repo.TenantMigrations.CreateFileConversions},
    {20_190_717_120_204, Lotta.Repo.TenantMigrations.AddContentModuleFile},
    {20_190_720_125_805, Lotta.Repo.TenantMigrations.AddPreviewAndBannerToArticles},
    {20_190_724_110_849, Lotta.Repo.TenantMigrations.ModifyArticlesPreviewToText},
    {20_190_725_173_446, Lotta.Repo.TenantMigrations.AddConfigurationToContentModule},
    {20_190_809_181_349, Lotta.Repo.TenantMigrations.RenameArticlePageToTopic},
    {20_190_809_231_412, Lotta.Repo.TenantMigrations.CreateUserGroups},
    {20_190_809_231_604, Lotta.Repo.TenantMigrations.UpdateUserModel},
    {20_190_810_080_925, Lotta.Repo.TenantMigrations.CreateUserUserGroup},
    {20_190_813_034_823, Lotta.Repo.TenantMigrations.CreateTableArticleUsers},
    {20_190_813_035_603, Lotta.Repo.TenantMigrations.ChangeArticleUserToArticleUsers},
    {20_190_813_195_949, Lotta.Repo.TenantMigrations.UpdateCategories},
    {20_190_814_192_813, Lotta.Repo.TenantMigrations.AddReadyToPublishToArticle},
    {20_190_816_174_952, Lotta.Repo.TenantMigrations.AddHideFromHomepageToCategories},
    {20_190_816_212_012, Lotta.Repo.TenantMigrations.AddIsPinnedToTopToArticle},
    {20_190_818_141_625, Lotta.Repo.TenantMigrations.AddGroupToArticle},
    {20_190_818_173_410, Lotta.Repo.TenantMigrations.AddAvatarImageFileToUser},
    {20_190_822_104_307, Lotta.Repo.TenantMigrations.MakeEmailFieldUniqueForUsers},
    {20_190_828_051_723, Lotta.Repo.TenantMigrations.AddIsSidenavToCategory},
    {20_190_913_174_502, Lotta.Repo.TenantMigrations.CreateWidgets},
    {20_190_914_071_849, Lotta.Repo.TenantMigrations.AddTenantToWidget},
    {20_190_914_123_922, Lotta.Repo.TenantMigrations.CreateTableCategoriesWidgets},
    {20_190_915_152_816, Lotta.Repo.TenantMigrations.AddIsHomepageToCategory},
    {20_190_916_144_141, Lotta.Repo.TenantMigrations.AddIconFileToWidget},
    {20_191_031_225_035, Lotta.Repo.TenantMigrations.AddLastSeenToUsers},
    {20_191_106_151_657, Lotta.Repo.TenantMigrations.AddLogoImageFileToTenant},
    {20_191_106_181_848, Lotta.Repo.TenantMigrations.AddCustomThemeToTenant},
    {20_191_113_100_401, Lotta.Repo.TenantMigrations.RenameGroupPriorityToSortKey},
    {20_191_113_103_801, Lotta.Repo.TenantMigrations.CreateArticlesUserGroupsTable},
    {20_191_113_110_451, Lotta.Repo.TenantMigrations.CreateCategoriesUserGroupsTable},
    {20_191_113_110_615, Lotta.Repo.TenantMigrations.CreateWidgetsUserGroupsTable},
    {20_191_116_152_451, Lotta.Repo.TenantMigrations.AddBackgroundImageFileToTenant},
    {20_191_116_190_306, Lotta.Repo.TenantMigrations.AddHideFullNameToUser},
    {20_191_121_051_815,
     Lotta.Repo.TenantMigrations.ChangeArticleContentModulesReferenceToDeleteAll},
    {20_191_127_121_820, Lotta.Repo.TenantMigrations.ChangeArticleArticlesReferenceToNullify},
    {20_191_127_165_625, Lotta.Repo.TenantMigrations.CreateCustomDomains},
    {20_191_130_171_915, Lotta.Repo.TenantMigrations.CreateGroupEnrollmentTokens},
    {20_191_222_073_522, Lotta.Repo.TenantMigrations.AddIsPublicToFiles},
    {20_191_223_101_045, Lotta.Repo.TenantMigrations.ChangeFilesTenantIdReference},
    {20_200_112_115_421, Lotta.Repo.TenantMigrations.CreateBlockedTenants},
    {20_200_118_180_125, Lotta.Repo.TenantMigrations.CreateUsersEnrollmentTokens},
    {20_200_129_192_945, Lotta.Repo.TenantMigrations.CreateContentModuleResults},
    {20_200_320_142_152, Lotta.Repo.TenantMigrations.ChangeUsersAvatarImageFileReference},
    {20_200_323_190_846, Lotta.Repo.TenantMigrations.CreateTableDirectories},
    {20_200_413_160_925, Lotta.Repo.TenantMigrations.AddLayoutNameToCategories},
    {20_200_423_110_714, Lotta.Repo.TenantMigrations.AddTenantUniqueIndexToSlug},
    {20_200_508_182_111, Lotta.Repo.TenantMigrations.AddContentToContentModule},
    {20_200_523_105_806, Lotta.Repo.TenantMigrations.ChangeArticlesCategoryReferenceToDeleteAll},
    {20_200_606_034_207, Lotta.Repo.TenantMigrations.ChangeCategoriesBannerImageFileOnDelete},
    {20_200_606_040_326, Lotta.Repo.TenantMigrations.ChangeArticlesPreviewImageFileOnDelete},
    {20_200_617_202_813,
     Lotta.Repo.TenantMigrations.ChangeUserEmailsToHaveLowercaseIndexAndMergeCaseInsensitiveDuplicateUsers},
    {20_200_705_111_328, Lotta.Repo.TenantMigrations.AddMetadataToFilesAndFileConversions},
    {20_200_809_110_726, Lotta.Repo.TenantMigrations.ChangeFilesAndDirectoriesToOnDelete},
    {20_200_823_093_017, Lotta.Repo.TenantMigrations.RemoveTenantColumns},
    {20_200_830_113_650, Lotta.Repo.TenantMigrations.UsersEnrollmentTokensChangeUserIdToOnDelete},
    {20_201_128_023_153, Lotta.Repo.TenantMigrations.CreateMessages},
    {20_201_213_094_811,
     Lotta.Repo.TenantMigrations.ChangePreviewAndBannerImageFilesOnDeleteToNothing},
    {20_210_105_204_029, Lotta.Repo.TenantMigrations.ChangeMessagingContentFromStringToText},
    {20_210_131_054_718, Lotta.Repo.TenantMigrations.AddPasswordHashFormatToUser},
    {20_210_308_020_700, Lotta.Repo.TenantMigrations.AddPublishedToArticles},
    {20_210_314_165_919, Lotta.Repo.TenantMigrations.AddHasChangedDefaultPasswordToUsers},
    {20_210_316_185_715, Lotta.Repo.TenantMigrations.ChangeArticlesCategoryOnDelete},
    {20_210_411_181_153, Lotta.Repo.TenantMigrations.ChangeFileIdsToBinaryIds},
    {20_210_507_184_033, Lotta.Repo.TenantMigrations.CreateRemoteStorageEntities},
    {20_210_508_114_834, Lotta.Repo.TenantMigrations.ChangeArticleTopicToTags},
    {20_210_710_154_646, Lotta.Repo.TenantMigrations.MakeFileIdsUnique},
    {20_211_204_061_555, Lotta.Repo.TenantMigrations.AddMessageConversations},
    {20_211_218_082_811, Lotta.Repo.TenantMigrations.CreateConversationUserLastSeenTable},
    {20_220_422_152_445, Lotta.Repo.TenantMigrations.ChangeEnrollmentTokensToArrays},
    {20_230_529_160_231, Lotta.Repo.TenantMigrations.AddMessageFile},
    {20_230_912_192_027, Lotta.Repo.TenantMigrations.AddSearchToArticlesAndContentmodules},
    {20_231_003_064_073, Lotta.Repo.TenantMigrations.AddUserDevices},
    {20_231_122_205_912, Lotta.Repo.TenantMigrations.AddFeedback},
    {20_231_211_135_976, Lotta.Repo.TenantMigrations.ChangeFeedbackContentToText},
    {20_240_303_164_027, Lotta.Repo.TenantMigrations.AddCanReadFullNameToUserGroups},
    {20_240_711_212_714, Lotta.Repo.TenantMigrations.AddReactionsEnabledToArticle},
    {20_240_712_194_738, Lotta.Repo.TenantMigrations.CreateArticleReactions},
    {20_240_803_115_041, Lotta.Repo.TenantMigrations.CreateCalendarAndEvents},
    {20_240_826_060_632, Lotta.Repo.TenantMigrations.MakeUserGroupIsAdminGroupNotNull},
    {20_240_826_093_644, Lotta.Repo.TenantMigrations.MakeUserGroupCanReadFullNameNotNull},
    {20_241_021_202_316, Lotta.Repo.TenantMigrations.AddTimezoneToEvents},
    {20_250_613_222_825,
     Lotta.Repo.TenantMigrations.RemoveFileUUIDAndRemoteLocationFromFileConversions},
    {20_250_613_222_828,
     Lotta.Repo.TenantMigrations.MoveEveryFuckingFileConversionToAnOrderlyLocation},
    {20_250_613_222_830, Lotta.Repo.TenantMigrations.NowMoveFiles},
    {20_250_627_065_517, Lotta.Repo.TenantMigrations.AddPagesToFileAndRemoveFullMetadata},
    {20_250_629_003_832, Lotta.Repo.TenantMigrations.MakeConversionFormatsUnique},
    {20_250_711_004_039, Lotta.Repo.TenantMigrations.MakeUsergroupEnrollmenttokensArrayNonNull},
    {20_250_803_132_452, Lotta.Repo.TenantMigrations.AddEduplacesIdsToUsersAndGroups}
  ]

  @spec create_tenant_database_schema(Tenant.t()) :: {:ok, [integer()]}
  def create_tenant_database_schema(tenant) do
    config =
      Application.get_env(:lotta, Repo)
      |> Keyword.put(:name, nil)
      |> Keyword.put(:pool_size, 2)
      |> Keyword.put(:migration_default_prefix, tenant.prefix)
      |> Keyword.put(:prefix, tenant.prefix)
      |> Keyword.delete(:pool)

    {:ok, pid} = Repo.start_link(config)
    Repo.put_dynamic_repo(pid)

    query = """
    CREATE SCHEMA IF NOT EXISTS "#{tenant.prefix}"
    """

    Repo.query!(query)

    SchemaMigration.ensure_schema_migrations_table!(Repo, config, [])

    migrations =
      run_migrations(
        prefix: tenant.prefix,
        dynamic_repo: pid
      )

    Repo.stop(1000)
    Repo.put_dynamic_repo(Repo)

    {:ok, migrations}
  end

  @spec delete_tenant_schema(Tenant.t()) :: :ok | {:error, term()}
  def delete_tenant_schema(%Tenant{prefix: prefix}) do
    query = """
    DROP SCHEMA "#{prefix}" CASCADE
    """

    case Repo.query(query) do
      {:ok, _} ->
        :ok

      other ->
        other
    end
  end

  @doc """
  Run migrations for a given tenant
  """
  @doc since: "2.6.0"
  @spec run_migrations(Keyword.t()) :: [integer()]
  def run_migrations(options \\ []) do
    options = Keyword.put(options, :all, true)

    Ecto.Migrator.run(
      Repo,
      @migrations,
      :up,
      options
    )
  end

  @doc """
  Rollback migrations for a given tenant
  """
  @doc since: "2.6.0"
  @spec rollback_migrations(Keyword.t()) :: [integer()]
  def rollback_migrations(options \\ []) do
    Ecto.Migrator.run(
      Repo,
      @migrations,
      :down,
      options
    )
  end
end
