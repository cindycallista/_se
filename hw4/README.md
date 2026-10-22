# HW4 — Git and GitHub Workflow

Student: 楊莉思 (111210555)

Live Guide: https://cindycallista.github.io/_se/hw4/

This exercise records the commands and GitHub actions used to create a branch, merge changes, fork a repository, and open a pull request.

## Repository roles

- Upstream course repository: https://github.com/ccc115a/_se
- Student fork: https://github.com/cindycallista/_se
- Working branch example: `feature/git-workflow-notes`

## 1. Create a branch

```bash
git clone https://github.com/cindycallista/_se.git
cd _se
git switch -c feature/git-workflow-notes
git add hw4
git commit -m "Add Git workflow guide"
git push -u origin feature/git-workflow-notes
```

A branch keeps unfinished work separate from the stable `main` branch.

## 2. Merge the branch

```bash
git switch main
git pull origin main
git merge --no-ff feature/git-workflow-notes
git push origin main
```

`--no-ff` preserves a merge commit, so the feature branch remains visible in the project history.

## 3. Fork a repository

1. Open the upstream repository on GitHub.
2. Select **Fork** and choose the student account.
3. Clone the fork and add the original project as `upstream`.

```bash
git clone https://github.com/cindycallista/_se.git
cd _se
git remote add upstream https://github.com/ccc115a/_se.git
git remote -v
git fetch upstream
```

## 4. Open a pull request

1. Push a feature branch to the fork.
2. Select **Compare & pull request** on GitHub.
3. Set the base repository and base branch as the destination.
4. Review the diff, write a clear summary, and create the pull request.

```bash
git push -u origin feature/git-workflow-notes
```

## Workflow used

This exercise follows **GitHub Flow with the Fork and Pull model**. `main` stays deployable, work is completed on a short-lived branch, and changes are reviewed before merging. Git Flow is more complex because it keeps permanent `main` and `develop` branches plus feature, release, and hotfix branches.

