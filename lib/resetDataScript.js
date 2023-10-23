import fs from 'fs';

const pathOg = 'data/records_og.csv';
const pathTemp = 'data/records_temp.csv';
const pathWorking = 'data/records_working.csv';

fs.copyFileSync(pathOg, pathWorking);
fs.writeFileSync(pathTemp, '');
