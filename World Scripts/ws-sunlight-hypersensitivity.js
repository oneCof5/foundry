// World Script Module Required to run this.
Hooks.on("createActiveEffect", (effect) => {
  if (effect.label.toLowerCase() === "sunlight") {
    // check for hypersensitivity
    let hyper = effect.parent.effects.find(e => e.label.toLowerCase() === 'sunlight hypersensitivity');
    if (!hyper) return {};
    if (hyper.disabled) {
      hyper.update({ 'disabled': false });
    }
  }
});

Hooks.on("deleteActiveEffect", (effect) => {
  if (effect.label.toLowerCase() === "sunlight") {
    // check for hypersensitivity
    let hyper = effect.parent.effects.find(e => e.label.toLowerCase() === 'sunlight hypersensitivity');
    if (!hyper) return {};
    if (!hyper.disabled) {
      hyper.update({ 'disabled': true });
    }
  }
});