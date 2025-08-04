#!/bin/sh

pass=true

files=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(js|json|html|md|scss|ts|yml)$')
if [ "$files" != "" ]; then

    # Run prettier before commit
    echo "$files" | xargs ./node_modules/.bin/prettier --experimental-cli --write
    if [ $? -ne 0 ]; then
        pass=false
    fi

    # Automatically add files that may have been fixed by prettier
    echo "$files" | xargs git add
fi

files=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(html|ts)$')
if [ "$files" != "" ]; then

    # Run eslint before commit
    printf -- '--lint-file-patterns %s\n' $files | xargs ./node_modules/.bin/ng lint --fix
    if [ $? -ne 0 ]; then
        pass=false
    fi

    # Automatically add files that may have been fixed by eslint
    echo "$files" | xargs git add
fi

if $pass; then
    exit 0
else
    echo ""
    echo "PRE-COMMIT HOOK FAILED:"
    echo "Code style validation failed. Please fix errors and try committing again."
    exit 1
fi
