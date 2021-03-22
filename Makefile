AWS_BUCKET            = s3://cubecss
AWS_REGION            = us-east-1
CACHE_FOREVER         = --cache-control="max-age=1576800000"
NO_CACHE              = --cache-control="max-age=0, no-cache"
ASSETS_ONLY           = --exclude "*" --include "*.js" --include "*.css" --include "*.svg" --include "*.woff" --include "*.eot" --include "*.ttf" --include "*.woff2" --include "*.png"
HTML_ONLY             = --exclude "*" --include "*.html"
AWS_COMMAND           = aws s3 sync dist/ ${AWS_BUCKET}/ --region ${AWS_REGION} --acl=public-read --delete
DEPLOY_ASSETS_COMMAND = ${AWS_COMMAND} ${NO_CACHE} ${ASSETS_ONLY}
DEPLOY_HTML_COMMAND   = ${AWS_COMMAND} ${NO_CACHE} ${HTML_ONLY}

all: deploy

build:
	npm run build

deploy: build
	${DEPLOY_ASSETS_COMMAND}
	${DEPLOY_HTML_COMMAND}

.PHONY: deploy
