const type = document.querySelector('#task-type');
const output = document.querySelector('#output');
const constraint = document.querySelector('#constraint');
const result = document.querySelector('#prompt-output');

function buildPlan() {
  const coding = type.value === 'code';
  const model = coding ? 'Muse Spark 1.3' : 'NVIDIA GLM 5.3 Flash (Low)';
  const verification = coding
    ? 'Run syntax checks and test the main user flow.'
    : 'Check structure, facts, tone, and spelling.';
  result.textContent = `Model: ${model}\n\nTask: ${output.value.trim()}\nConstraint: ${constraint.value.trim()}\n\nReturn the finished result, list the files or sections changed, and explain how it was verified.\nVerification: ${verification}`;
}

document.querySelector('#build-plan').addEventListener('click', buildPlan);
buildPlan();
