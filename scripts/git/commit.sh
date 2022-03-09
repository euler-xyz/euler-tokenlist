set -e

dt=$(date '+%d/%m/%Y');
echo "$dt"

git add .
git commit -m "Tokenlist Update $dt"
git push
