[GimmePlay](http://gimmeplay.com) turns your [Gimme Bar](https://gimmebar.com) collections into playlists. It's build in [Node.js](http://nodejs.org/) and powered by the [Gimme Bar API](https://gimmebar.com/api/v1).

# Installation

- `git clone git@github.com:andbirkebaek/gimmeplay.git my_gimmeplay`
- `cd my_gimmeplay && npm install -d`
- `COOKIE_SECRET=[cookie secret] SESSION_SECRET=[session secret] node app.js`

## Notes
- `[cookie secret]` & `[session secret]` can be replaced by any string.
- The [Connect Framework](http://www.senchalabs.org/connect/) can't be installed on Node.js versions newer than 0.6.X, but it's not used at the moment, so you can ignore the errors.

## Contributors

- [Andreas Birkebæk](http://twitter.com/andreasb)
- [Bedrich Rios](http://twitter.com/bedrich)
- [Evan Haas](http://twitter.com/sirevanhaas)