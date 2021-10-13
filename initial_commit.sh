#!/bin/bash
rm -rf .git
git init
git add .
git commit -m "Initial Commit"
git remote add origin https://github.com/ChangUk/document-collection.git
git push -u --force origin master
