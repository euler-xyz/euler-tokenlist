set -e
dt=$(date '+%d/%m/%Y');

git restore .
git checkout master
git pull
git checkout -b "bot-update-$dt"
