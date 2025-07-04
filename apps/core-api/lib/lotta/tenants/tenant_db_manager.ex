defmodule Lotta.Tenants.TenantDbManager do
  @moduledoc """
  Utilities that help with managing tenant's prefixed databases.
  """

  alias Lotta.Repo.TenantMigrations

  @migrations [
    {20_190_523_113_923, TenantMigrations.CreateUsers},
    {20_190_523_115_155, TenantMigrations.CreateArticles},
    {20_190_523_145_657, TenantMigrations.AddPasswordHash},
    {20_190_527_144_741, TenantMigrations.CreateTenants},
    {20_190_529_223_707, TenantMigrations.CreateCategories},
    {20_190_530_082_941, TenantMigrations.AddTenantIdToCategory},
    {20_190_530_100_535, TenantMigrations.AddTenantIdToArticles},
    {20_190_615_141_426, TenantMigrations.CreateContentModules},
    {20_190_621_220_836, TenantMigrations.AddSortKeyToContentModule},
    {20_190_707_202_512, TenantMigrations.CreateFiles},
    {20_190_714_093_933, TenantMigrations.AddNicknameToUser},
    {20_190_716_183_344, TenantMigrations.CreateFileConversions},
    {20_190_717_120_204, TenantMigrations.AddContentModuleFile},
    {20_190_720_125_805, TenantMigrations.AddPreviewAndBannerToArticles},
    {20_190_724_110_849, TenantMigrations.ModifyArticlesPreviewToText},
    {20_190_725_173_446, TenantMigrations.AddConfigurationToContentModule},
    {20_190_809_181_349, TenantMigrations.RenameArticlePageToTopic},
    {20_190_809_231_412, TenantMigrations.CreateUserGroups},
    {20_190_809_231_604, TenantMigrations.UpdateUserModel},
    {20_190_810_080_925, TenantMigrations.CreateUserUserGroup},
    {20_190_813_034_823, TenantMigrations.CreateTableArticleUsers},
    {20_190_813_035_603, TenantMigrations.ChangeArticleUserToArticleUsers},
    {20_190_813_195_949, TenantMigrations.UpdateCategories},
    {20_190_814_192_813, TenantMigrations.AddReadyToPublishToArticle},
    {20_190_816_174_952, TenantMigrations.AddHideFromHomepageToCategories},
    {20_190_816_212_012, TenantMigrations.AddIsPinnedToTopToArticle},
    {20_190_818_141_625, TenantMigrations.AddGroupToArticle},
    {20_190_818_173_410, TenantMigrations.AddAvatarImageFileToUser},
    {20_190_822_104_307, TenantMigrations.MakeEmailFieldUniqueForUsers},
    {20_190_828_051_723, TenantMigrations.AddIsSidenavToCategory},
    {20_190_913_174_502, TenantMigrations.CreateWidgets},
    {20_190_914_071_849, TenantMigrations.AddTenantToWidget},
    {20_190_914_123_922, TenantMigrations.CreateTableCategoriesWidgets},
    {20_190_915_152_816, TenantMigrations.AddIsHomepageToCategory},
    {20_190_916_144_141, TenantMigrations.AddIconFileToWidget},
    {20_191_031_225_035, TenantMigrations.AddLastSeenToUsers},
    {20_191_106_151_657, TenantMigrations.AddLogoImageFileToTenant},
    {20_191_106_181_848, TenantMigrations.AddCustomThemeToTenant},
    {20_191_113_100_401, TenantMigrations.RenameGroupPriorityToSortKey},
    {20_191_113_103_801, TenantMigrations.CreateArticlesUserGroupsTable},
    {20_191_113_110_451, TenantMigrations.CreateCategoriesUserGroupsTable},
    {20_191_113_110_615, TenantMigrations.CreateWidgetsUserGroupsTable},
    {20_191_116_152_451, TenantMigrations.AddBackgroundImageFileToTenant},
    {20_191_116_190_306, TenantMigrations.AddHideFullNameToUser},
    {20_191_121_051_815, TenantMigrations.ChangeArticleContentModulesReferenceToDeleteAll},
    {20_191_127_121_820, TenantMigrations.ChangeArticleArticlesReferenceToNullify},
    {20_191_127_165_625, TenantMigrations.CreateCustomDomains},
    {20_191_130_171_915, TenantMigrations.CreateGroupEnrollmentTokens},
    {20_191_222_073_522, TenantMigrations.AddIsPublicToFiles},
    {20_191_223_101_045, TenantMigrations.ChangeFilesTenantIdReference},
    {20_200_112_115_421, TenantMigrations.CreateBlockedTenants},
    {20_200_118_180_125, TenantMigrations.CreateUsersEnrollmentTokens},
    {20_200_129_192_945, TenantMigrations.CreateContentModuleResults},
    {20_200_320_142_152, TenantMigrations.ChangeUsersAvatarImageFileReference},
    {20_200_323_190_846, TenantMigrations.CreateTableDirectories},
    {20_200_413_160_925, TenantMigrations.AddLayoutNameToCategories},
    {20_200_423_110_714, TenantMigrations.AddTenantUniqueIndexToSlug},
    {20_200_508_182_111, TenantMigrations.AddContentToContentModule},
    {20_200_523_105_806, TenantMigrations.ChangeArticlesCategoryReferenceToDeleteAll},
    {20_200_606_034_207, TenantMigrations.ChangeCategoriesBannerImageFileOnDelete},
    {20_200_606_040_326, TenantMigrations.ChangeArticlesPreviewImageFileOnDelete},
    {20_200_617_202_813,
     TenantMigrations.ChangeUserEmailsToHaveLowercaseIndexAndMergeCaseInsensitiveDuplicateUsers},
    {20_200_705_111_328, TenantMigrations.AddMetadataToFilesAndFileConversions},
    {20_200_809_110_726, TenantMigrations.ChangeFilesAndDirectoriesToOnDelete},
    {20_200_823_093_017, TenantMigrations.RemoveTenantColumns},
    {20_200_830_113_650, TenantMigrations.UsersEnrollmentTokensChangeUserIdToOnDelete},
    {20_201_128_023_153, TenantMigrations.CreateMessages},
    {20_201_213_094_811, TenantMigrations.ChangePreviewAndBannerImageFilesOnDeleteToNothing},
    {20_210_105_204_029, TenantMigrations.ChangeMessagingContentFromStringToText},
    {20_210_131_054_718, TenantMigrations.AddPasswordHashFormatToUser},
    {20_210_308_020_700, TenantMigrations.AddPublishedToArticles},
    {20_210_314_165_919, TenantMigrations.AddHasChangedDefaultPasswordToUsers},
    {20_210_316_185_715, TenantMigrations.ChangeArticlesCategoryOnDelete},
    {20_210_411_181_153, TenantMigrations.ChangeFileIdsToBinaryIds},
    {20_210_507_184_033, TenantMigrations.CreateRemoteStorageEntities},
    {20_210_508_114_834, TenantMigrations.ChangeArticleTopicToTags},
    {20_210_710_154_646, TenantMigrations.MakeFileIdsUnique},
    {20_211_204_061_555, TenantMigrations.AddMessageConversations},
    {20_211_218_082_811, TenantMigrations.CreateConversationUserLastSeenTable},
    {20_220_422_152_445, TenantMigrations.ChangeEnrollmentTokensToArrays},
    {20_230_529_160_231, TenantMigrations.AddMessageFile},
    {20_230_912_192_027, TenantMigrations.AddSearchToArticlesAndContentmodules},
    {20_231_003_064_073, TenantMigrations.AddUserDevices},
    {20_231_122_205_912, TenantMigrations.AddFeedback},
    {20_231_211_135_976, TenantMigrations.ChangeFeedbackContentToText},
    {20_240_303_164_027, TenantMigrations.AddCanReadFullNameToUserGroups},
    {20_240_711_212_714, TenantMigrations.AddReactionsEnabledToArticle},
    {20_240_712_194_738, TenantMigrations.CreateArticleReactions},
    {20_240_803_115_041, TenantMigrations.CreateCalendarAndEvents},
    {20_240_826_060_632, TenantMigrations.MakeUserGroupIsAdminGroupNotNull},
    {20_240_826_093_644, TenantMigrations.MakeUserGroupCanReadFullNameNotNull},
    {20_241_021_202_316, TenantMigrations.AddTimezoneToEvents},
    {20_250_613_222_828, TenantMigrations.MigrateToSelfhostedFileConversions},
    {20_250_627_065_517, TenantMigrations.AddPagesToFileAndRemoveFullMetadata},
    {20_250_629_003_832, TenantMigrations.MakeConversionFormatsUnique}
  ]

  alias Ecto.Migration.SchemaMigration
  alias Lotta.Tenants.Tenant
  alias Lotta.Repo

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
