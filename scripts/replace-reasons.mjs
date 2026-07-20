import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('src/components/CentroUniversoSection.jsx', 'utf8');

const startMarker = '{/* Local reasons CRUD editor */}';
const endMarker = '      <div className={`base-dates-editor';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found!');
  process.exit(1);
}

const replacement = `<CrudEditorPanel
        collectionLabel="100 razones"
        collectionName="reasons"
        activeCrudModule={activeCrudModule}
        activeCrudAction={activeCrudAction}
        activeCrudFilter={activeCrudFilter}
        onCrudFilterClick={handleCrudFilterClick}
        crud={reasonsCrud}
        fields={reasonsFields}
        listFields={['title', 'text']}
        editorPanelId="local-reasons-editor"
        baseEditorPanelId="base-reasons-editor"
      />

`;

const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);
writeFileSync('src/components/CentroUniversoSection.jsx', newContent);
console.log('Replaced', endIdx - startIdx, 'chars with', replacement.length, 'chars');
console.log('Savings:', (endIdx - startIdx) - replacement.length, 'chars');
