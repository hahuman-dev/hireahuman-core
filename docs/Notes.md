# Notes / Scratch

Use this file during development to jot down pain points, design decisions, and "we should improve X later".

This prevents losing context when we refactor.
Update it freely.

## Make scripts
### That marks your bash scripts as “executable” — they’ll then run properly from make.

chmod +x db/scripts/*.sh

eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa_personal
ssh-add ~/.ssh/id_rsa_hah

ssh -T git@github-HAH