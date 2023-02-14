// https://discord.com/channels/170995199584108546/699750150674972743/1074476230117687347
const target = game.user.targets.first();
if(!target) return ui.notifications.warn("You need a target.");

const use = await item.use();
if (!use) return;

const spellLevel = use.flags.dnd5e.use.spellLevel;
const targetsToJumpTo = spellLevel - 3;

// enemies will be the potential secondary targets to choose from (conditions : within 30ft distance of the primary target and health is above 0)
const enemies = canvas.scene.tokens.filter(function(secondary) {
  if (token.document === secondary) return false;
  if (secondary === target.document) return false;
  if (!secondary.actor) return false;
  if (!(secondary.actor.system.attributes?.hp?.value > 0)) return false;
  return canvas.grid.measureDistance(target, secondary.object) <= 32.5;
});

const targetList = enemies.reduce((acc, enemy) => {
  return acc + `
  <div class="form-group">
    <label><img src="${enemy.texture.src}" style="border: none; height: 30px; width: 30px;"> - ${enemy.name}</label>
    <div class="form-fields">
      <input type="checkbox" class="target" data-id="${enemy.id}">
    </div>
  </div>`;
}, "");

const content = `<p>Your Chain Lightning can jump to <b>${targetsToJumpTo}</b> targets.</p><form>${targetList}</form>`;

return Dialog.prompt({
  rejectClose: false,
  title: item.name,
  label: "Damage!",
  content,
  callback: chainLightning
});

async function chainLightning(html) {
  const targets = [...html[0].querySelectorAll("input")].reduce((acc, node) => {
    if (!node.checked) return acc;
    acc.push(canvas.scene.tokens.get(node.dataset.id));
    return acc;
  }, []);

  const damage = await item.rollDamage();
  if (!damage) return;

  const seq = new Sequence();
  const filePrimary = "jb2a.chain_lightning.primary.blue";
  const fileSecondary = "jb2a.static_electricity.02.blue";
  const fileTertiary = "jb2a.chain_lightning.secondary.blue";

  seq
  .effect().file(filePrimary).atLocation(token).stretchTo(target).waitUntilFinished(-1100)
  .effect().file(fileSecondary).atLocation(target).wait(100);

  for(const t of targets) seq.effect().file(fileTertiary).atLocation(target).stretchTo(t).wait(100);

  return seq.play();
}