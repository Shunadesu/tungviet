// Quick SSR check: does rendering an object as a React child throw?
import { renderToString } from 'react-dom/server';
import React from 'react';

const applications = [
  { title: 'Cải thiện độ cứng', titleEn: '', _id: 'a' },
];

let error = null;
try {
  renderToString(
    React.createElement('span', null, applications.map((app, i) =>
      React.createElement('span', { key: i }, app)
    ))
  );
} catch (e) {
  error = e;
}

console.log('THROWN:', error ? error.message : 'no error');
