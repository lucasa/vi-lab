#!/bin/bash

# author: niels.seidel@nise81.com
# makes compresses json-file readable by common editors. It inserts line breaks and tabs. 
# usefull after getting converted popcorn code

value=$(cat ../data-slides-raw.json | sed "s/]},/\n]},\n/g" | sed "s/},{/},\n\t{/g" | sed 's/\(\.[0-9]\)[0-9]*/\1/g')
echo "done, wrote file data-slides-raw.json"
#    | sed "s/{[ /{\n[ /g"

echo "$value" > ../data-slides-raw.json



