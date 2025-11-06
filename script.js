// Simple sequential typer and reveal (refactored)
document.addEventListener('DOMContentLoaded', () => {
  const commands = Array.from(document.querySelectorAll('.command'));
  const initialDelay = 1500; // ms delay before starting
  const typeDelay = 100;    // base ms per character (adjust for speed)
  const beforeDelay = 0;  // ms pause before typing
  const jitter = 30; // max +/- ms random jitter per character

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  // computeDelay: returns a delay with jitter
  function computeDelay() {
    const delta = Math.floor((Math.random() * jitter * 2) - jitter);
    let delay = Math.max(10, typeDelay + delta);
    return delay;
  }

  // showCursorAfter: place the single cursor element immediately after a given element
  function showCursorAfter(cursor, element) {
    if (!cursor || !element) return;
    element.insertAdjacentElement('afterend', cursor);
    cursor.style.visibility = 'visible';
  }

  // typeCommand: types text into element using cursor; uses computeDelay for character timing 
  // jumps cursor to nextAdmin after typing
  async function typeCommand(element, text, cursor, nextAdmin) {
    if (cursor) showCursorAfter(cursor, element);
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      element.textContent += ch;
      await wait(computeDelay());
      // if we've finished a word jump cursor to next admin-like span
      if (i === text.length - 1) {
        jumpCursorToNextAdmin(cursor, nextAdmin);
      }
    }
  }
  

  // jumpCursorToNextAdmin: moves cursor to next admin-like span if it exists. Otherwise, jumps to last-admin
  async function jumpCursorToNextAdmin(cursor, nextAdmin) {
    if (cursor && nextAdmin && /output-/.test(nextAdmin.className)) {
      nextAdmin.classList.remove('hidden');
      nextAdmin.classList.add('visible');
      showCursorAfter(cursor, nextAdmin);
    } else {
      const lastAdmin = document.querySelector('.last-admin');
      if (cursor && lastAdmin) {
        showCursorAfter(cursor, lastAdmin);
      }
    }
  }

  // revealOutputs: reveals all elements matching .output-<target> and waits for their transitions
  async function revealOutputs(target) {
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

  // runSequence: orchestrates the typing and reveal sequence
  async function runSequence() {

    // store each command's original text and clear it so headings are hidden until typed
    commands.forEach(cmd => {
      if (!cmd.dataset.original) cmd.dataset.original = cmd.textContent.trim();
      cmd.textContent = '';
    });

    const cursor = document.querySelector('.cursor');

    const firstAdmin = commands[0] ? commands[0].previousElementSibling : null;
    firstAdmin.classList.remove('hidden');
    firstAdmin.classList.add('visible');
    showCursorAfter(cursor, firstAdmin);

    await wait(initialDelay);

    for (let i = 0; i < commands.length; i++) {
      await wait(beforeDelay);

      const cmd = commands[i];
      const toType = cmd.getAttribute('data-original') || cmd.textContent.trim();
      cmd.classList.remove('hidden');
      cmd.classList.add('visible');
      // determine the admin-like span before the next command so the cursor can jump there after a word
      const nextCmd = commands[i+1];
      const nextAdmin = nextCmd ? nextCmd.previousElementSibling : null;
      await typeCommand(cmd, toType, cursor, nextAdmin);
      await revealOutputs(cmd.dataset.target);
      // reveal the admin-like span immediately before the next command (if present)
      if (nextAdmin && /output-/.test(nextAdmin.className)) {
        nextAdmin.classList.remove('hidden');
        nextAdmin.classList.add('visible');
        if (cursor) showCursorAfter(cursor, nextAdmin);
      }
    }
  }

  runSequence();
});
