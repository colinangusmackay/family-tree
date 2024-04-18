#!/bin/sh

# Exit the script immediately if any command exits with a non-zero status
set -e

# For diagnostics list the version numbers of the installed tools
echo BASH version:
bash --version

echo 
echo PWSH version:
pwsh --version

echo 
echo Gem Version:
gem --version

echo 
echo Jekyll version:
jekyll --version

echo 
echo Bundle version:
bundle --version

echo 
echo Git Version
git --version

export REPO_NAME="$(basename `git rev-parse --show-toplevel`)"

git config --global --add safe.directory /workspaces/$REPO_NAME

# gem install bundler
bundle install --gemfile=/workspaces/$REPO_NAME/Gemfile

# This is the platform used for the GitHub Action workflow
bundle lock --add-platform x86_64-linux
