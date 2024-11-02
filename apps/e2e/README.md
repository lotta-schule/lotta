# Lotta End-to-End Tests

[Lotta](https://lotta.schule) End-to-End Test Suite powered by [Playwright](https://playwright.dev/).

These are the humble beginnings of a more complete test suite that will hopefully cover all the important parts of the
Lotta application and give us more confidence in our changes as well as reduce our manual testing efforts.

## Running the test suite

For the time being, our efforts are focused on building a solid test suite that can be run from the docker images
we build in our pipelines and use for production deployments.

The setup should run as-is, with dummy data, test users and credentials provided.
For different setups or environments, have a look at `scripts/test.sh` and adjust the environment variables accordingly.

```bash
# While in the root of the e2e directory, start the lotta docker images
docker compose up -d

# Alternativly, nother version than 'latest' can be used:
IMAGE_TAG=<someother> docker compose up -d

# Run the tests
./scripts/test.sh

# Test options can be passed to the script. For example to test with UI:
./scripts/test.sh --ui
```
