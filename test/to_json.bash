#!/bin/bash

# This script is helpful if you use a controller-styled paradigm.
#
# Copy your controller files into the directory you'd wish to use
# as your local testing file-system-eque database.
#
# Then, run this script outside of that directory.

# TODO: Replace "database" with the directory you'd wish to turn into json files
cd database

for t in $(ls)
do

  echo "------------ ${t} ------------"
  echo ""
  echo "var t=\"${t}\";console.log(t.split('.')[0] + '.json');">"${t}"
  echo `cat "${t}"`
  echo ""
  echo `node "${t}"`>"${t}"
  echo `cat "${t}"`
  echo ""

  touch `cat "${t}"`
  rm "${t}"

done

exit 0