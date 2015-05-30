<!--
[![Header image, 728px wide, @2x for hi-dpi devices.](preview.png)](https://github.com/kennethormandy/font-feature-abettings)

***
-->

# Font Feature Abettings

Collect glyph names from a font’s OpenType `gsub` data.

A small, [Browserify](https://github.com/substack/node-browserify)-compatabile module that is passed a font’s list of potential substitutions (the OpenType `gsub` table) and turns them into a usable list of root character names, sorted by OpenType feature.

## Getting started

This isn’t useful for anything yet. The data was generated in advance for one font that is excluded from the repo.

```sh
git clone https://github.com/kennethormandy/font-feature-abettings
cd font-feature-abettings
npm install -g harp
npm install
npm start
```

## Notes

I manually added in:

```json
"76": 530,
```

…to the `liga` object. I don’t know why it was missing, while it could be an issue with the OpenType library, it’s more likely I have it broken in the tester and didn’t get the full `gsub` table.

## License

The MIT License (MIT)

Copyright © 2014 [Kenneth Ormandy](http://kennethormandy.com)
