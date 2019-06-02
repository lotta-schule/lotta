# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Api.Repo.insert!(%Api.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.
Api.Accounts.register_user(%{ name: "Alexis Rinaldoni", email: "alexis.rinaldoni@einsa.net", password: "test123" })
Api.Accounts.register_user(%{ name: "Christopher Bill", email: "billy@einsa.net", password: "test123" })
Api.Accounts.register_user(%{ name: "Eike Wiewiorra", email: "eike.wiewiorra@einsa.net", password: "test123" })

{:ok, web_tenant} = Api.Repo.insert(%Api.Tenants.Tenant{ slug: "web", title: "Web Beispiel" })

{:ok, profil} = Api.Repo.insert(%Api.Tenants.Category{ tenant_id: web_tenant.id, title: "Profil" })
Api.Repo.insert(%Api.Tenants.Category{ tenant_id: web_tenant.id, title: "GTA" })
Api.Repo.insert(%Api.Tenants.Category{ tenant_id: web_tenant.id, title: "Projekt" })
{:ok, faecher} = Api.Repo.insert(%Api.Tenants.Category{ tenant_id: web_tenant.id, title: "Fächer" })
Api.Repo.insert(%Api.Tenants.Category{ tenant_id: web_tenant.id, title: "Material" })
Api.Repo.insert(%Api.Tenants.Category{ tenant_id: web_tenant.id, title: "Galerien" })

# Fächer
Api.Repo.insert(%Api.Tenants.Category{ tenant_id: web_tenant.id, title: "Sport", category_id: faecher.id })
Api.Repo.insert(%Api.Tenants.Category{ tenant_id: web_tenant.id, title: "Kunst", category_id: faecher.id })
Api.Repo.insert(%Api.Tenants.Category{ tenant_id: web_tenant.id, title: "Sprache", category_id: faecher.id })

# Profil
Api.Repo.insert(%Api.Tenants.Category{ tenant_id: web_tenant.id, title: "Podcast", category_id: profil.id })
Api.Repo.insert(%Api.Tenants.Category{ tenant_id: web_tenant.id, title: "Offene Kunst-AG", category_id: profil.id })
Api.Repo.insert(%Api.Tenants.Category{ tenant_id: web_tenant.id, title: "Schülerzeitung", category_id: profil.id })
Api.Repo.insert(%Api.Tenants.Category{ tenant_id: web_tenant.id, title: "Oskar-Reime-Chor", category_id: profil.id })
Api.Repo.insert(%Api.Tenants.Category{ tenant_id: web_tenant.id, title: "Schüler-Radio", category_id: profil.id })

# Articles
Api.Repo.insert(%Api.Content.Article{
    tenant_id: web_tenant.id,
    category_id: profil.id,
    title: "And the oskar goes to ...",
    preview: "Hallo hallo hallo",
    preview_image_url: "https://placeimg.com/640/480/animals"
})
Api.Repo.insert(%Api.Content.Article{
    tenant_id: web_tenant.id,
    category_id: profil.id,
    title: "Landesfinale Volleyball WK IV",
    preview: "Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale \"Jugend trainiert für Europa\" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...",
    preview_image_url: "https://placeimg.com/640/480/architecture"
})
Api.Repo.insert(%Api.Content.Article{
    tenant_id: web_tenant.id,
    category_id: profil.id,
    title: "Der Podcast zum WB 2",
    preview: "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.",
    page_name: "KleinKunst 2018",
    preview_image_url: "https://placeimg.com/640/480/people",
})
Api.Repo.insert(%Api.Content.Article{
    tenant_id: web_tenant.id,
    category_id: profil.id,
    title: "Der Vorausscheid",
    preview: "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.",
    page_name: "KleinKunst 2018",
    preview_image_url: "https://placeimg.com/640/480/tech",
})