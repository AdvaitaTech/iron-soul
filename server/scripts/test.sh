#!/bin/bash
DBNAME="iron_test"
DIR=$(pwd)
FILE="$DIR/scripts/schema.sql"
SEED="$DIR/scripts/seed.sql"
if [ -f "$FILE" ] && [ "$DBNAME" != "" ]
then
  echo "DBNAME - $DBNAME"
  echo "psql -f $FILE $DBNAME"
  dropdb "$DBNAME"
  createdb "$DBNAME"
  psql -f "$FILE" "$DBNAME"
  psql -f "$SEED" "$DBNAME"
  ENV=test go test ./... "$*"
else
  echo "please run this from the root of the server directory"
fi
