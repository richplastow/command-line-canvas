# Running Rust Four Ways

**A minimal example Rust app, that can be run in four different ways**

After completing the steps below, you'll be able to run a Rust app:

1. As a standalone binary, compiled for your current platform
2. From a Node.js 'wrapper' app, using `child_process.execSync()`
3. In a web browser, using Rust compiled to WebAssembly (wasm)
4. In Node.js again, this time using WebAssembly

**Confirmed to work on:**

- macOS Tahoe (M4)
- macOS Monterey (Intel)
- Windows 11 PowerShell
- Windows Subsystem for Linux (wsl)
e
This guide is intended to be a useful reference - a jumping-off point for your
own projects. If you follow the steps outlined below, you will gain a deeper
understanding of the different ways your JavaScript app can run Rust code.

### Start with a simple JavaScript helper

Make a directory to build the example Rust app, and 'change directory' into it:  
`mkdir ~/example-rust-app; cd ~/example-rust-app`

Assuming you have VS Code installed, use the `code` command followed by a dot
`"."` to launch VS Code and open a new window:  
`code . # you may need to click 'Yes, I trust the authors'`

Then, still on the command line, use `code` followed by a path to create a blank
file in a new folder and start editing it:  
`code helpers/ansi.js`

Paste the following JavaScript into the blank 'ansi.js' file:

```js
// helpers/ansi.js

/** Makes functions which wrap text in ANSI styling.
 * @param {number} bg  An ANSI 256-color code */
const ansi = (bg) => (text) => `\x1b[31;97;48;5;${bg}m ${text} \x1b[0m `;

/** Wraps text in a red-background ANSI code, followed by a space.
 * @param {string} text */
export const red = ansi(52);

/** Wraps text in a green-background ANSI code, followed by a space.
 * @param {string} text */
export const green = ansi(22);

/** Wraps text in a blue-background ANSI code, followed by a space.
 * @param {string} text */
export const blue = ansi(18);
```

You should see that VS Code highlights the code syntax. Hovering your mouse over
the `red` function name should show that VS Code parses the JSDoc comments.

After saving the file, you should see it appear in your OS's filesystem, and
also the filesystem tab of VS Code's 'Explorer' sidebar.

### Begin setting up the 'package.json' file

Generate a fairly minimal 'package.json' file:  
`npm init -y`

In this project, the JavaScript run by Node will be using `import` instead
of the old `require()`, so a `"type"` property set to `"module"` must be added
to 'package.json'.

Open the newly-created 'package.json' file in VS Code:  
`code package.json`

Replace the line `"main": "index.js",` (which is not needed) with:  
`  "type": "module",`

Change the default `"test"` script from:  
`    "test": "echo \"Error: no test specified\" && exit 1"`  
to:  
`    "test": "node scripts/test-all.js"`

Create a directory called 'scripts', and create a placeholder file
'scripts/test-all.js':  
`code scripts/test-all.js`

```js
// scripts/test-all.js

import { blue } from '../helpers/ansi.js';

console.log(`${blue('TODO')}Tests will be run from here`);
```

Check that it's working. This will confirm that a recent enough version of
Node.js is installed, which has the correct permissions to run your .js files:  
`npm test`  
...you should see `TODO Tests will be run from here`  
where `TODO` has a blue background.

### Create the app's source files

Create a directory called 'src', and create the following three Rust files,
'src/lib.rs', 'src/main.rs' and 'src/utils.rs':  
`code src/lib.rs src/main.rs src/utils.rs`

```rs
// src/lib.rs

// wasm-pack uses wasm-bindgen to build and generate a JavaScript
// binding file. This line imports the wasm-bindgen crate.
use wasm_bindgen::prelude::*;

mod utils;
use utils::greet as greet_util;

// wasm-pack needs exported functions to be prefixed `#[wasm_bindgen]`.
#[wasm_bindgen]
pub fn greet(text: &str) -> String {

    // Use default text if no `text` argument exists.
    if text == "" {
        return format!("{}", greet_util("wasm app"))
    } else {
        return format!("{}", greet_util(&text))
    };
}
```

```rs
// src/main.rs

mod utils;
use utils::greet;

fn main() {
    // Convert command line arguments to a vector.
    let args: Vec<_> = std::env::args().collect();

    // Use default text if no command line arguments exist.
    // Otherwise, use the second string in `args` (the first option).
    let text = if args.len() <= 1 {
        "standalone binary app".to_string()
    } else {
        format!("{}", args[1])
    };

    // Print text to the console.
    println!("{}", greet(&text))
}
```

```rs
// src/utils.rs

pub fn greet(text: &str) -> String {
    return format!("Hello from Rust, {}!", text)
}
```

### Build and test the standalone binary

The first way of running Rust is the simplest. It's also the odd one out,
because the compiled Rust program is run directly, not by JavaScript.

Create a directory called 'dist', and inside that, create a directory called
'1-standalone-binary':  
`mkdir dist; mkdir dist/1-standalone-binary`

Create the JavaScript file 'scripts/build-1-standalone-binary.js', which
will compile the standalone binary app:  
`code scripts/build-1-standalone-binary.js`

```js
// scripts/build-1-standalone-binary.js

import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { green, red } from '../helpers/ansi.js';

// Get the distribution-folder path, and the compiled binary filename.
const dir = join('dist', '1-standalone-binary');
const file = process.platform.slice(0, 3) === 'win' ? 'greet.exe' : 'greet';

try {
    // Delete any files generated during a previous build.
    'greet|greet.exe|greet.pdb'.split('|').forEach(prevFile => rmSync(
        join(dir, prevFile),
        { force: true }, // don't stop if the file doesn't exist
    ));

    // Compile the binary, and then show an 'OK!' or 'Error!' message.
    const result = execSync(
        'rustc ' + // the Rust compiler
        'src/main.rs ' + // the main source file
        `-o ${join(dir, file)}` // the compiled binary app
    ).toString();
    console.log(green('OK!') + (result || 'rustc succeeded'));
} catch (err) { console.error(red('Error!') + '\n', err); process.exit(1) }
```

Create another JavaScript file 'scripts/test-1-standalone-binary.js', which will
run a couple of unit tests on the standalone binary app:  
`code scripts/test-1-standalone-binary.js`

```js
// scripts/test-1-standalone-binary.js

import { equal } from 'node:assert';
import { execSync } from 'node:child_process';
import { green, red } from '../helpers/ansi.js';

// Get the path to the compiled binary app.
const path = process.platform.slice(0, 3) === 'win'
  ? 'dist\\1-standalone-binary\\greet.exe'
  : './dist/1-standalone-binary/greet'

// Run the tests, and then show a 'Pass!' or 'Fail!' message.
try {
    const result1 = execSync(path).toString();
    equal(result1, 'Hello from Rust, standalone binary app!\n');

    const result2 = execSync(
        `${path} "console arguments user" extra args`
    ).toString();
    equal(result2, 'Hello from Rust, console arguments user!\n');

    console.log(green('Pass!') + 'Both 1-standalone-binary tests passed');
} catch (err) { console.error(red('Fail!') + '\n', err); process.exit(1) }
```

Back in 'package.json', add two new scripts above `"test"`:  
`    "build:1": "node scripts/build-1-standalone-binary.js",`  
`    "test:1": "node scripts/test-1-standalone-binary.js",`

Compile the standalone binary app:  
`npm run build:1`  
...you should see `OK! rustc succeeded`

If you're running PowerShell in Windows, the 'dist/1-standalone-binary/'
directory should now contain 'greet.exe' and 'greet.pdb'. The .pdb file just
contains debug info generated while compiling and linking 'greet.exe'. Check
that you can run the Rust binary 'greet.exe' from the command line:  
`dist\1-standalone-binary\greet.exe "quick check"`

If you're on macOS, Linux or Windows WSL, the 'dist/1-standalone-binary/'
directory should just contain a Rust binary with no extension, named 'greet'.
Check that it runs:  
`./dist/1-standalone-binary/greet "quick check"`

Whichever platform you're on, you should see `Hello from Rust, quick check!`

Run the unit tests:  
`npm run test:1`  
...you should see `Pass! Both 1-standalone-binary tests passed`

### Create and test the Node.js 'wrapper' app

There's no build step this time, because the Node.js 'wrapper' app just makes
use of the [compiled standalone binary.](#build-and-test-the-standalone-binary)

The Node wrapper app is divided into two Node files. Create a second directory
inside 'dist' called '2-node-wrapper', and make the 'cli.js' and 'wrapper.js':  
`code dist/2-node-wrapper/cli.js dist/2-node-wrapper/wrapper.js`

```js
// dist/2-node-wrapper/cli.js

import { wrapper } from './wrapper.js';

console.log(wrapper(process.argv[2]));
```

```js
// dist/2-node-wrapper/wrapper.js

import child_process from 'node:child_process';
import { red } from '../../helpers/ansi.js';

// Get the path to the compiled binary app.
const path = process.platform.slice(0, 3) === 'win'
  ? 'dist\\1-standalone-binary\\greet.exe'
  : './dist/1-standalone-binary/greet'

export const wrapper = (text) => {
    try {
        const result = child_process.execSync(
            `${path} "${text || 'Node.js wrapper app'}"`
        ).toString().trim();
        return result || '[no output]';
    } catch (err) { console.error(red('Error!') + '\n', err); process.exit(1) }
};
```

Create 'scripts/test-2-node-wrapper.js', which will run unit tests on the
wrapper.js module, and also run integration tests on the cli.js app:  
`code scripts/test-2-node-wrapper.js`

```js
// scripts/test-2-node-wrapper.js

import { equal } from 'node:assert';
import child_process from 'node:child_process';
import { green, red } from '../helpers/ansi.js';
import { wrapper } from '../dist/2-node-wrapper/wrapper.js';

try {
    const result1 = wrapper();
    equal(result1, 'Hello from Rust, Node.js wrapper app!');

    const result2 = wrapper('passed to imported module');
    equal(result2, 'Hello from Rust, passed to imported module!');

    const result3 = child_process.execSync(
        'node ./dist/2-node-wrapper/cli.js'
    ).toString();
    equal(result3, 'Hello from Rust, Node.js wrapper app!\n');

    const result4 = child_process.execSync(
        'node ./dist/2-node-wrapper/cli.js' +
        ' "passed to Node CLI app" extra args'
    ).toString();
    equal(result4, 'Hello from Rust, passed to Node CLI app!\n');

    console.log(green('Pass!') + 'All four 2-node-wrapper tests passed');
} catch (err) { console.error(red('Fail!') + '\n', err); process.exit(1) }
```

Back in 'package.json', add a new script above `"test"`:  
`    "test:2": "node scripts/test-2-node-wrapper.js",`

Run the unit tests:  
`npm run test:2`  
...you should see `Pass! All four 2-node-wrapper tests passed`

### Build for the web browser, and test

To run Rust in a browser, it must be compiled to WebAssembly (wasm). Unlike the
Rust binary above, WebAssembly code is OS-agnostic - in other words, the same
.wasm file can run on Linux, macOS and Windows. But a .wasm file compiled for
the browser cannot be run by Node.js, and a .wasm file compiled for Node.js
cannot run in a browser.

Create another directory inside 'dist', called '3-web-browser-wasm':  
`mkdir dist/3-web-browser-wasm`

The `#[wasm_bindgen]` in 'src/lib.rs' means that a 'Cargo.toml' file must be
created. It has the same content, whether you're targeting `nodejs` or `web`:  
`code Cargo.toml`

```toml
# Cargo.toml

[package]
name = "example-rust-app"
version = "1.0.0"
authors = ["Your Name <your@name.com>"]
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
```

The first time `wasm-pack build ...` is run, a 'Cargo.lock' file will be
generated alongside 'Cargo.toml', and `wasm-bindgen` and its sub-dependencies
will be installed in a new 'target/' directory.

Next, create the JavaScript file 'scripts/build-3-web-browser-wasm.js', which
will be used to generate a WebAssembly app targeting web browsers:  
`code scripts/build-3-web-browser-wasm.js`

```js
// scripts/build-3-web-browser-wasm.js

import child_process from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { green, red } from '../helpers/ansi.js';

const outDir = join('dist', '3-web-browser-wasm');

try {
    // Delete any files generated during a previous build.
    '.gitignore|greet_bg.wasm|greet_bg.wasm.d.ts|greet.d.ts|greet.js'
        .split('|').forEach(filename => rmSync(
            join(outDir, filename),
            { force: true }, // don't stop if the file doesn't exist
        ));

    // Generate a WebAssembly app targeting web browsers.
    const result = child_process.execSync(
        'wasm-pack build ' + // generate the .js, .ts and .wasm files
        '--target web ' + // set the target environment
        '--no-pack ' + // do not generate a 'package.json' file
        `--out-dir ${outDir} ` + // the output directory
        '--out-name greet' // basis for naming the generated files
    ).toString();
    console.log(green('OK!') + '\n', result);
} catch (err) { console.error(red('Error!') + '\n', err); process.exit(1) }
```

Create another JavaScript file 'scripts/test-3-web-browser-wasm.js', which will
start a localhost server on port 1234 for testing the app:  
`code scripts/test-3-web-browser-wasm.js`

```js
// scripts/test-3-web-browser-wasm.js

import { readFileSync } from 'node:fs';
import http from 'node:http';
import { blue, red } from '../helpers/ansi.js';

const indexHtml = `
<!-- /index.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>test-3-web-browser-wasm</title>
    <script type="module" src="/script.js"></script>
    <style>
      body { background:#111; color:#ccc;
        font: 18px/30px Arial, sans-serif;
        transition: background-color 1s, color 1s; }
      body.fail { background:#211; color:#fcc; }
      body.pass { background:#121; color:#cfc; }
    </style>
  </head>
  <body>
    <h1>test-3-web-browser-wasm</h1>
    <pre></pre>
  </body>
</html>
`;

// Convert the .wasm file to a Data URL string. This will be used to
// test an alternative way of loading WebAssembly into JavaScript.
const wasm = readFileSync(`./dist/3-web-browser-wasm/greet_bg.wasm`);
const encoded = Buffer.from(wasm, 'binary').toString('base64');
const chunks = encoded.split('').reduce((acc, char, i) => i % 1000
  ? (acc[acc.length-1] = acc.at(-1)+char) && acc : [...acc, [char]], []);
const dataUrl = `data:application/wasm;base64,\n${chunks.join('\n')}`;

const scriptJs = `
// /script.js
(async function() {
  const $log = document.querySelector('pre');
  const log = (message) => $log.innerText += \`\${message}\`;
  log("'dist/3-web-browser-wasm/greet_bg.wasm' is ${wasm.length} bytes\\n");

  try {

    // Load the WebAssembly code from file, in the usual way.
    const standard = await import('./greet.js?standard');
    await standard.default('./greet_bg.wasm');
    const result1 = standard.greet('');
    log(\`\\nstandard.greet("") -> "\${result1}" \`);
    const ok1 = result1 === 'Hello from Rust, wasm app!';
    log(ok1 ? '✅' : '❌');
    const result2 = standard.greet('web browser (standard)');
    log(\`\\nstandard.greet("web browser (standard)") -> "\${result2}" \`);
    const ok2 = result2 === 'Hello from Rust, web browser (standard)!';
    log(ok2 ? '✅' : '❌');

    // Use the Data URL version of the WebAssembly code.
    const dataUrl = await import('./greet.js?dataUrl');
    await dataUrl.default(\`
${dataUrl}
    \`);
    const result3 = dataUrl.greet('');
    log(\`\\ndataUrl.greet("") -> "\${result3}" \`);
    const ok3 = result3 === 'Hello from Rust, wasm app!';
    log(ok3 ? '✅' : '❌');
    const result4 = dataUrl.greet('web browser (dataUrl)');
    log(\`\\ndataUrl.greet("web browser (dataUrl)") -> "\${result4}" \`);
    const ok4 = result4 === 'Hello from Rust, web browser (dataUrl)!';
    log(ok4 ? '✅' : '❌');

    document.body.className = ok1 && ok2 && ok3 && ok4 ? 'pass' : 'fail';
    if (ok1 && ok2 && ok3 && ok4)
      log('\\n\\nPass! All four 3-web-browser-wasm tests passed');

  } catch (err) {
    log(\`\\n\\nError!\\n\${err.message}\\n(See browser console)\`);
    document.body.className = 'fail';
    console.error('Error!', err);
  }
})();
`;

const fromDist = (filename) =>
    readFileSync(`./dist/3-web-browser-wasm${filename}`)

const respond = (res, status, mime, content) => {
    res.writeHead(status, { 'Content-Type': mime });
    res.end(content);
}

try {
    http.createServer((req, res) => {
        switch (req.url) {
            case '/':
            case '/index.html':
                respond(res, 200, 'text/html', indexHtml);
                break;
            case '/greet.js?standard':
            case '/greet.js?dataUrl':
                respond(res, 200, 'text/javascript', fromDist('/greet.js'));
                break;
            case '/greet_bg.wasm':
                respond(res, 200, 'application/wasm', fromDist(req.url));
                break;
            case '/script.js':
                respond(res, 200, 'text/javascript', scriptJs);
                break;
            default:
                respond(res, 200, 'text/plain', 'Not Found');
        }
    }).listen(1234);
    console.log(blue('Ready!')
        + '\nOpen http://localhost:1234/ to run web browser wasm tests.'
        + '\nPress ctrl-c to close this server.');
} catch (err) { console.error(red('Error!') + '\n', err); process.exit(1) }
```

Back in 'package.json', add two new scripts above `"test"`:  
`    "build:3": "node scripts/build-3-web-browser-wasm.js",`  
`    "test:3": "node scripts/test-3-web-browser-wasm.js",`

Compile the web browser WebAssembly app:  
`npm run build:3`  
...it may seem to freeze the first time it's run, but you should eventually see:  
`OK!`

Start the local server:  
`npm run test:3`  
...you should see:  
`Ready!`  
`Open http://localhost:1234/ to run web browser wasm tests.`  
`Press ctrl-c to close this server.`

The browser should show the test results, and you should see:  
`Pass! All four 3-web-browser-wasm tests passed`

Back on the command line, hold down the 'control' key and press 'c' to stop
running the `test:3` server.

### Build and test the Node.js WebAssembly app

Create the fourth output-directory in 'dist', called '4-node-wasm', and
then create 'scripts/build-4-node-wasm.js', which will be used to generate
a WebAssembly app targeting Node.js:  
`code scripts/build-4-node-wasm.js`

```js
// scripts/build-4-node-wasm.js

import child_process from 'node:child_process';
import { renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { green, red } from '../helpers/ansi.js';

const outDir = join('dist', '4-node-wasm');

try {
    // Delete any files generated during a previous build.
    '.gitignore|greet_bg.wasm|greet.cjs|greet_bg.wasm.d.ts|greet.d.ts'
        .split('|').forEach(filename => rmSync(
            join(outDir, filename),
            { force: true }, // don't stop if the file doesn't exist
        ));

    // Generate a WebAssembly app targeting Node.js.
    const result = child_process.execSync(
        'wasm-pack build ' + // generate the .js, .ts and .wasm files
        '--target nodejs ' + // set the target environment
        '--no-pack ' + // do not generate a 'package.json' file
        `--out-dir ${outDir} ` + // the output directory
        '--out-name greet' // basis for naming the generated files
    ).toString();
    console.log(green('OK!') + '\n', result);

    // This project has set `"type": "module"` in 'package.json',
    // so rename 'greet.js' (which uses `require()`) to 'greet.cjs'.
    renameSync(join(outDir, 'greet.js'), join(outDir, 'greet.cjs'));

} catch (err) { console.error(red('Error!') + '\n', err); process.exit(1) }
```

Create 'scripts/test-4-node-wasm.js', which will run tests on 'greet.cjs'
and 'greet_bg.wasm':  
`code scripts/test-4-node-wasm.js`

```js
// scripts/test-4-node-wasm.js

import { equal } from 'node:assert';
import dist from '../dist/4-node-wasm/greet.cjs';
import { green, red } from '../helpers/ansi.js';
const { greet } = dist;

try {
    // Check that WebAssembly is supported in the current version of Node.
    if (typeof WebAssembly !== 'object') throw Error(
      `typeof WebAssembly is '${typeof WebAssembly}' not 'object'`);

    const result1 = greet('');
    equal(result1, 'Hello from Rust, wasm app!');

    const result2 = greet('Node.js WebAssembly app');
    equal(result2, 'Hello from Rust, Node.js WebAssembly app!');

    console.log(green('Pass!') + 'Both 4-node-wasm tests passed');
} catch (err) { console.error(red('Fail!') + '\n', err); process.exit(1) }
```

Back in 'package.json', add two new scripts above `"test"`:  
`    "build:4": "node scripts/build-4-node-wasm.js",`  
`    "test:4": "node scripts/test-4-node-wasm.js",`

Compile the Node.js WebAssembly app:  
`npm run build:4`  
...you should see:  
`OK!`

Run the unit tests on it:  
`npm run test:4`  
...you should see `Pass! Both 4-node-wasm tests passed`

### Combine the three build steps into a single 'build-all.js' file

Create a new JavaScript file in 'scripts' called 'build-all.js':  
`code scripts/build-all.js`

```js
// scripts/build-all.js

import { green } from '../helpers/ansi.js';

console.log('Running "./build-1-standalone-binary.js"...');
await import('./build-1-standalone-binary.js');
console.log('\nRunning "./build-3-web-browser-wasm.js"...');
await import('./build-3-web-browser-wasm.js');
console.log('Running "./build-4-node-wasm.js"...');
await import('./build-4-node-wasm.js');
console.log(green('Done!') + 'All three builds succeeded');
```

Add a new script above `"test"` in 'package.json':  
`    "build": "node scripts/build-all.js",`

Try out the build-all script:  
`npm run build`  
...you should see `Done! All three builds succeeded`

### Combine the four unit test files into a single 'test-all.js' file

Replace 'scripts/test-all.js' with:

```js
// scripts/test-all.js

import { green } from '../helpers/ansi.js';

console.log('Running "./test-1-standalone-binary.js"...');
await import('./test-1-standalone-binary.js');
console.log('\nRunning "./test-2-node-wrapper.js"...');
await import('./test-2-node-wrapper.js');
console.log('\nRunning "./test-4-node-wasm.js"...');
await import('./test-4-node-wasm.js');
console.log(`
\n${green('Done!')}All three command-line tests passed.
\nRunning "./test-3-web-browser-wasm.js"...\n`);
import('./test-3-web-browser-wasm.js');
```

Check that the following script exists in 'package.json':  
`    "test": "node scripts/test-all.js",`

Try out the test-all script:  
`npm test`  
...you should see `Done! All three command-line tests passed`,  
followed by instructions for manually running the browser tests.
