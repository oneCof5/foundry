const theTokens = canvas.tokens.controlled;
if (theTokens.length === 0) {
  ui.error(`No tokens selected.`);
  return
}
const elevation = await getNumberDialog;
console.log(theTokens.map(t => ({"_id":t.document.id, "elevation": elevation})));
//await canvas.scene.updateEmbeddedDocuments('Token', theTokens.map(t => ({"_id":t.document.id, "elevation": elevation})))

async function getNumberDialog() {
  let value = await new Promise((resolve) => {
    new Dialog({
      title: 'Change Elevation: ',
      content: `<table style="width:100%">
                    <tr>
                        <th>
                            <label>enter new elevation:</label>
                        </th>
                        <td>
                        <input type="number" name="elev" id="focusHere" autofocus>
                        </td>
                   </tr>
               </table>`,
      buttons: {
        Ok: {
          label: 'Submit',
          callback: (html) => { resolve(html.find('elev').val()); }
        }
      },
      default: "Ok"
    }).render(true);
  })
  return value
};