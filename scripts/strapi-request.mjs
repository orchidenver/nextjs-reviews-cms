import { writeFileSync } from 'node:fs';
import qs from 'qs';

const url = 'http://localhost:1337/api/reviews' + '?' + qs.stringify({
    fields: ['slug', 'title', 'subtitle', 'publishedAt'], // add fields with data
    populate: { image: { fields: ['url'] } }, // add media & path
    sort: ['publishedAt:desc'],
    pagination: { pageSize: 6, page: 1 }, // get 6 reviews initially
}, { encodeValuesOnly: true }); // not encode params names, only values
console.log('url:', url);
const response = await fetch(url);
const body = await response.json();
const formatted = JSON.stringify(body, null, 2);
const file = 'scripts/strapi-response.json'; // create a path and filename where the file with JSON data will be located
writeFileSync(file, formatted, 'utf8'); // write response to a file

