RUN_WORKSPACE = yarn workspace

install:
	yarn install

build:
	yarn tsc --build --force

uninstall:
	rm -rf node_modules

clean:
	rm -rf dist

run-all:
	${RUN_WORKSPACE} express-server start
	${RUN_WORKSPACE} fastify-server start
	${RUN_WORKSPACE} nodejs-server start