const steps = {
  branch: {
    number: 'Step 1',
    title: 'Create a branch',
    purpose: 'Keep unfinished work isolated from the stable main branch.',
    command: 'git switch -c feature/git-workflow-notes\ngit add hw4\ngit commit -m "Add Git workflow guide"\ngit push -u origin feature/git-workflow-notes',
    check: 'Check: the new branch appears in the GitHub branch selector.'
  },
  merge: {
    number: 'Step 2',
    title: 'Merge into main',
    purpose: 'Bring the reviewed feature history back to the primary branch.',
    command: 'git switch main\ngit pull origin main\ngit merge --no-ff feature/git-workflow-notes\ngit push origin main',
    check: 'Check: main contains the feature commit and a merge commit.'
  },
  fork: {
    number: 'Step 3',
    title: 'Connect a fork',
    purpose: 'Work in a personal copy while still tracking the original repository.',
    command: 'git clone https://github.com/cindycallista/_se.git\ncd _se\ngit remote add upstream https://github.com/ccc115a/_se.git\ngit remote -v',
    check: 'Check: origin points to the fork and upstream points to the course repository.'
  },
  pr: {
    number: 'Step 4',
    title: 'Open a pull request',
    purpose: 'Request review before changes are merged into the destination branch.',
    command: 'git push -u origin feature/git-workflow-notes\n# GitHub: Compare & pull request\n# Review files changed, add a summary, then create the PR',
    check: 'Check: the PR shows the correct base repository, base branch, and file diff.'
  }
};

const number = document.querySelector('#step-number');
const title = document.querySelector('#step-title');
const purpose = document.querySelector('#step-purpose');
const command = document.querySelector('#step-command');
const check = document.querySelector('#step-check');
const copyButton = document.querySelector('#copy-command');

function showStep(key) {
  const item = steps[key];
  number.textContent = item.number;
  title.textContent = item.title;
  purpose.textContent = item.purpose;
  command.textContent = item.command;
  check.textContent = item.check;
  document.querySelectorAll('.steps button').forEach((button) => {
    button.classList.toggle('active', button.dataset.step === key);
  });
}

document.querySelectorAll('.steps button').forEach((button) => {
  button.addEventListener('click', () => showStep(button.dataset.step));
});

copyButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(command.textContent);
  copyButton.textContent = 'Copied';
  setTimeout(() => { copyButton.textContent = 'Copy commands'; }, 1200);
});

showStep('branch');
