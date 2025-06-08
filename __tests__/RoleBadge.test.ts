import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RoleBadge } from '@/components/explore/RoleBadge';

describe('RoleBadge', () => {
  const profile = {
    rooms: 3,
    travel: 'Worldwide',
    genre: 'Hip Hop',
    daw: 'Ableton',
    mix: 'Analog',
  };

  (['studio','videographer','artist','producer','engineer'] as const).forEach(role => {
    test(`renders ${role} emoji`, () => {
      const html = renderToStaticMarkup(
        React.createElement(RoleBadge, { role, profile })
      );
      expect(html).toMatchSnapshot();
    });
  });
});
