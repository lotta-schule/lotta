start:
	docker-compose up

dependencies:
	docker-compose run app mix do deps.get, compile

setup_db:
	docker-compose run app mix ecto.setup

migrate_db:
	docker-compose run app mix ecto.migrate

tests:
	docker-compose -f docker-compose.yml -f docker-compose.test.yml run app mix test

tests-ci:
	mix test --cover