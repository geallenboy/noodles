import { exists } from './utils';
import path from 'path';

console.log(path.resolve('.'));
console.log(exists(path.resolve('.')));

(async function () {
  {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('ok');
  }
})();
