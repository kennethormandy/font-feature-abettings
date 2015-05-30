<!--
[![Header image, 728px wide, @2x for hi-dpi devices.](preview.png)](https://github.com/kennethormandy/font-feature-abettings)

***
-->

# Font Feature Abettings

Collect glyph names from a font’s OpenType `gsub` data.

A small, [Browserify](https://github.com/substack/node-browserify)-compatabile module that is passed a font’s list of potential substitutions (the OpenType `gsub` table) and turns them into a usable list of root character names, sorted by OpenType feature.

## Getting started

This is the underlying OpenType feature metadata sorter in the type tester we built for [Lost Type](http://twitter.com/losttypecoop). (If you’re interested in trying it out, [mention me on Twitter](https://twitter.com/kennethormandy) or [open an issue](https://github.com/kennethormandy/font-feature-abettings), we’re probably going to open sourcing soon!)

The example is [available here](https://font-feature-abettings.surge.sh). If you’d like to run the library or tests locally, run the following commands in your terminal after installing [Node.js](https://nodejs.org):

```sh
# Clone the repository
git clone https://github.com/kennethormandy/font-feature-abettings

# Move into the folder
cd font-feature-abettings

# Install the dependencies using npm, which came with Node.js
npm install

# Start the example
npm start

# The example is now being served at http://localhost:9040/examples
```

## Notes

I manually added in:

```json
"76": 530,
```

…to the `liga` object. I don’t know why it was missing, while it could be an issue with the OpenType library, it’s more likely I have it broken in the tester and didn’t get the full `gsub` table.

## License

[The MIT License (MIT)](LICENSE.md)

Copyright © 2014–2015 [Kenneth Ormandy](http://kennethormandy.com)
