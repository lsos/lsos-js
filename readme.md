# Lsos Library for JavaScript

:information_source: This readme is meant for developers of open source projects who want to integrate the Lsos. Users of Lsos projects can get more infos at [lsos.org](https://lsos.org).

See [Lsos - FAQ - What does the Lsos library do?](https://lsos.org/faq#lib) for an overview of what the Lsos libray does.

## Usage

~~~js
import { verify } from "lsos"; // npm install lsos

// The `lsos` package works in the browser as well as in Node.js.

verify({
  // Your npm package name
  npm: "my-open-source-project",

  // Your project name
  projectName: "My Open Source Project",

  // Only require an activation key when the user's repository had
  // `minNumberOfAuthors` Git authors in the last 3 months.
  minNumberOfAuthors: 3, // Default value

  // Show a `console.warn` instead of blocking the user.
  onlyWarning: false, // Default value

  // Free trial
  freeTrialDays: 7 // Default value
});
~~~

The `verify()` function throws an error if your user doesn't have an activation key,
with following exception:
- The user's repository had less than `minNumberOfAuthors` Git authors in the last 3 months.
  (If the repo has few authors we consider it to be a "small" project; the user can use your code without activation key and the `verify()` has no effects whatsoever.)
- The user's repository is public. (Allowing your project to be developed and contributed to without activation key.)
- The free trial didn't end. (A `console.info` is shown to the user letting him know that he is using the free trial.)
- The `onlyWarning` option is set to `true`. (A `console.warn` is shown instead of throwing an error. This means that users can indefinitely use your code without activation key. Such trust-based practice has shown many successes in the past, for example Sublime Text.)

Make sure that when `verify()` throws an error that it actually blocks the usage of your code.

<br/>

