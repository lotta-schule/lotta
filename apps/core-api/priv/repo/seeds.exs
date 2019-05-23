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

Api.Accounts.create_user(%{ name: "Alexis Rinaldoni", email: "alexis.rinaldoni@einsa.net" })
Api.Accounts.create_user(%{ name: "Christopher Bill", email: "billy@einsa.net" })
Api.Accounts.create_user(%{ name: "Eike Wiewiorra", email: "eike.wiewiorra@einsa.net" })

Api.Content.create_article(%{ title: "And the oskar goes to ...", preview: "Hallo hallo hallo" })
Api.Content.create_article(%{ title: "Landesfinale Volleyball WK IV", preview: "Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale \"Jugend trainiert für Europa\" im Volleyball. Nach beherztem Kampf im Finale unterlegen ..." })
Api.Content.create_article(%{ title: "Der Podcast zum WB 2", preview: "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert." })
Api.Content.create_article(%{ title: "Der Vorausscheid", preview: "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury." })