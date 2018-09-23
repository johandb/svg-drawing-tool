# Font Awesome unicode bindings
Get a [Font Awesome](http://fontawesome.io/) unicode character by the icon name.  
Especially useful for outputting to e.g. terminals with a [Font Awesome patched font](https://github.com/gabrielelana/awesome-terminal-fonts) or for [Lemonbar](https://www.npmjs.com/package/lemonbar).

## Usage:
```javascript
var fa = require("fontawesome");
console.log(fa("fort-awesome") + " Hello World!"); // Hello World!
console.log(fa.fortAwesome + " Hello World!"); // Hello World!
```
