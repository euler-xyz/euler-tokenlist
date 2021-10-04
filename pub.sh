#!/usr/bin/bash
current=$(jq '.tokens | length' ./euler-tokenlist.json)
echo "Current Tokens $current"
node ./index.js

latest=$(jq '.tokens | length' ./euler-tokenlist.json)
echo "Latest Tokens $latest"

if [[ $latest -gt $current ]]
then
    dt=$(date '+%d/%m/%Y');
    echo "$dt"

    git pull
    git add .
    git commit -m "Tokenlist Update Check $dt"
    git push
fi