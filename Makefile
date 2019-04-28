ci:
	make docker-build \
		clean \
		install \
		staging \
		staging-down

docker-build:
	docker build -t registry.gitlab.com/medienportal/web .

clean:
	docker-compose -f docker-compose.staging.yml run --rm clean

install:
	docker-compose -f docker-compose.staging.yml run --rm install

staging:
	docker-compose -f docker-compose.staging.yml up -d staging-deps
	docker-compose -f docker-compose.staging.yml run --rm staging

staging-down:
	docker-compose -f docker-compose.staging.yml down