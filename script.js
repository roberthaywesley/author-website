// Simple sequential typer and reveal (refactored)
document.addEventListener('DOMContentLoaded', () => {
  const commands = Array.from(document.querySelectorAll('.command'));
  const initialDelay = 1500; // ms delay before starting
  const typeDelay = 100;    // base ms per character (adjust for speed)
  const beforeDelay = 0;  // ms pause before typing
  const jitter = 30; // max +/- ms random jitter per character

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  function computeDelay() {
    const delta = Math.floor((Math.random() * jitter * 2) - jitter);
    let delay = Math.max(10, typeDelay + delta);
    return delay;
  }

  function showCursorAfter(cursor, element) {
    if (!element) {
      cursor.style.display = 'none';
    } else {
      element.insertAdjacentElement('afterend', cursor);
    cursor.style.visibility = 'visible';
    }
  }

  async function simulateTypedConsoleCommand(element, text, cursor) {
    if (cursor) showCursorAfter(cursor, element);
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
      await wait(computeDelay());
      element.textContent += text[i];
    }
  }

  async function simulateConsoleOutput(target) {
    if (!target) return;
    const outs = document.querySelectorAll('.output-' + target);
    if (!outs.length) return;
    const revealPromises = [];
    outs.forEach(element => {
      element.classList.remove('hidden');
      element.classList.add('visible');
      revealPromises.push(new Promise(resolve => {
        const onEnd = (e) => {
          if (['opacity','max-height','transform'].includes(e.propertyName)) {
            element.removeEventListener('transitionend', onEnd);
            resolve();
          }
        };
        element.addEventListener('transitionend', onEnd);
        setTimeout(resolve, 800);
      }));
    });
    await Promise.all(revealPromises);
  }

  async function runSequence() {

    // store each command's original text and clear it so headings are hidden until typed
    commands.forEach(cmd => {
      if (!cmd.dataset.original) cmd.dataset.original = cmd.textContent.trim();
      cmd.textContent = '';
    });

    cursor = document.createElement('span');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    const firstAdmin = commands[0] ? commands[0].previousElementSibling : null;
    showCursorAfter(cursor, firstAdmin);

    await wait(initialDelay);

    const lastAdmin = document.querySelector('.last-admin');

    for (let i = 0; i < commands.length; i++) {
      await wait(beforeDelay);

      const command = commands[i];
      const toType = command.getAttribute('data-original') || command.textContent.trim();
      command.classList.remove('hidden');
      command.classList.add('visible');// determine the admin-like span before the next command so the cursor can jump there after a word
      const nextCmd = commands[i+1];
      const nextAdmin = nextCmd ? nextCmd.previousElementSibling : null;
      await simulateTypedConsoleCommand(command, toType, cursor);
      showCursorAfter(cursor, nextAdmin ? nextAdmin : lastAdmin);
      await simulateConsoleOutput(command.dataset.target);
    }
  }

  runSequence();
});
