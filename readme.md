# Lsos Library for JavaScript

:information_source: This readme is meant for open source developers; if you are an Lsos project user see the [Lsos FAQ](https://lsos.org/faq) instead.

The Lsos Library enforces your fee: if a company uses your code without activation key, the library will `console.warn()` the company, and if the company persists in not getting an activation key, it will throw an error blocking the usage of your code.

The `lsos` npm package works in the browser as well as in Node.js.

## Usage

~~~js
import { verify } from "lsos"; // npm install lsos

verify({
  // Your npm package name
  npmName: "my-open-source-project",

  // Your project name
  projectName: "My Open Source Project",

  // Only require an activation key when the user's repository had
  // `minNumberOfAuthors` Git authors in the last 3 months
  minNumberOfAuthors: 3, // Default value

  // Show a `console.warn` instead of blocking the user.
  onlyWarning: false, // Default value

  // Free trial
  freeTrialDays: 7 // Default value
});
~~~

The `verify()` function throws an error if your user doesn't have an activation key,
with following exception:
- The user's repository has had less than `minNumberOfAuthors` Git authors in the last 3 months.
  (If the repo has few authors we consider it to be a "small" project and the `verify()` has no effects whatsoever.)
- The user's repository is public. (This means that your project can be developed and contributed to without activation key.)
- The free trial didn't end. (A `console.info` is shown to the user letting him know that he is using a free trial.)
- The `onlyWarning` option is set to `true`. (A `console.warn` is shown to the user and `verify()` never throws. This means that users can use your code without activation key indefinitely. This practice based on trust is common and shown many success in the past such as Sublime Text.)

Make sure that when `verify()` throws an error that it actually blocks the usage of your code.

<p align="center">
  <img src="/warning.png" />
</p>

<br/>

