#!/bin/sh

# git hook to call core-validate-commits when any commit (or amend) is done

# Author: Steven R. Loomis <srloomis@us.ibm.com>

# Usage:  commit-msg .git/COMMIT_EDITMSG
#  ( called by git )

# 0. install node
# 1. npm i -g core-validate-commits
# 2. ln -s `pwd`/commit-msg.sh   ~/src/node/.git/hooks/commit-msg
# ( You may be able to do
#      ln  -s /usr/local/lib/node_modules/core-validate-commit/commit-msg.sh \
#          ~/src/node/.git/hooks/commit-msg
#  to pull from the npm installed version)
# 3. make sure "commit-msg" is executable.

#Debug:
#pwd
#echo COMMIT-MSG $*
#env

# We'll use this as a temporary file.
# TODO: clean up after ourselves.
TMPF=$(mktemp)

#Debug:
#echo Temporary file: ${TMPF}


# We need to 'fix up' the commit message to emulate 'git show'
# 1. header information
# 2. 4 space indent
# 3. strip comments

# 1. add header
cat >"${TMPF}" <<EOF
commit 0
Author: ${GIT_AUTHOR_NAME} <${GIT_AUTHOR_EMAIL}>
Date:    Jan 1 00:00:00 1970 -0000

EOF

# 2/3. indent 4 spaces and remove comment lines.
grep -v '^#' < "${1}" | sed -e 's%^.*$%    &%'  >> "${TMPF}"

# by default, don't validate metadata
OPTS="--no-validate-metadata"

# Check which branch we're on
BRANCH=$(git symbolic-ref HEAD)

if [[ "${BRANCH}" == "refs/heads/master" ]];
then
    # we're on master - so be more careful
    # do validate metadata
    OPTS=""
fi


# Now, run! 

#Debug:
#set -x

core-validate-commit ${OPTS} "file://${TMPF}" ||
    ( echo "Please fix the above and try again. Your message is in ${1}" ; exit 1)
# TODO: rm "${TMPF}"  - or perhaps trap?

