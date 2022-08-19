set -e

dt=$(date '+%d/%m/%Y');
branch=$(git rev-parse --abbrev-ref HEAD);
echo "$dt"

git add .
git commit -m "Tokenlist Update $dt"
git push -u origin $branch

# TODO: fix brew on ec2 not to require next line 
eval $(~/.linuxbrew/bin/brew shellenv)
hub pull-request -m "Tokenlist Update $dt"