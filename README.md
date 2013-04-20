[GimmePlay](http://gimmeplay.com) turns your [Gimme Bar](https://gimmebar.com) collections into playlists. It's build in [Node.js](http://nodejs.org/) and powered by the [Gimme Bar API](https://gimmebar.com/api/v1).

# Installation
First, clone the app and install dependencies:
- `git clone git@github.com:andbirkebaek/gimmeplay.git my_gimmeplay`
- `cd my_gimmeplay && npm install -d`

Then, run the app:
- `COOKIE_SECRET=[cookie secret] SESSION_SECRET=[session secret] node app.js`

`[cookie secret]` & `[session secret]` can be replaced by any string.

You should now be able to access it at `localhost:3000`

## Contributors

- [Andreas Birkebæk](http://twitter.com/andreasb)
- [Bedrich Rios](http://twitter.com/bedrich)
- [Evan Haas](http://twitter.com/sirevanhaas)