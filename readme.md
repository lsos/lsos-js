# `@lsos/basic`

Fee enforcer for the [Lsos Basic](https://lsos.org/basic).

:warning: This readme is meant for open-source maintainers. If you are an open-source user, you don't need to know about the details explained here; if you want more information, check out the [Lsos Basic FAQ](https://lsos.org/basic/faq) instead.

The `@lsos/basic` package is about enforcing your fee: if a user that should pay your fee but uses your code without having purchased an activation key, then `@lsos/basic` will `console.warn()` your user, and if your user persists in not paying your fee, it will eventually throw an error blocking the usage of your code.

<br/>

[How it works](#how-it-works)
<br/>
[Usage](#usage)

## How it works

Everything starts with following question:
- Does your user's repository has less than `3` Git authors?

If yes,
then your user doesn't need any activation key and nothing happens; the `@lsos/basic` has no effect whatsoever.
This means that **the Lsos Basic makes no difference for hobbyists and most small companies**,
since there is nothing they need to do to use your code
and your code remains MIT licensed.

If no,
then the user needs a (free) activation key.
To let your user know that they need an activation key, the following happens:
1. During the free trial, nothing happens; the user can use your code without activation key.
2. After the free trial, a `console.warn()` is shown to your user saying that an activation key is required, but your user can still use your code without activation key.
3. After a while, if your user still didn't get a (free) activation key, we notify her in a more annoying way. For example, if your code runs in the browser, a `window.alert()` is shown instead of a mere `console.warn()`.
4.  If your user persists in not purchasing an activation key, eventually an error is thrown blocking the usage of your code.

**We appeal to the sympathy of your users have towards you, your project, and open source in general, rather than forcing; we use force as last resort.**

At the moment, it is relatively easy to cheat and circumvent the blocking mechanisms, but we will make it increasingly hard to cheat &mdash; shall too many try.

<p align="center">
  <img src="/warning.png" />
  Example of showing a warning to a user who should get a (free) activation key.
</p>

<br/>

## Usage

~~~js
import { verify } from "@lsos/basic";

verify({
  // Package name on npm
  npmName: "my-open-source-project",

  // Human-readable project name
  projectName: "My Open Source Project",

  // Skip if the user's repo has had less than 5 Git authors in the last 3 months.
  numberOfAuthors: 5,

  // Only show warnings: never show "annoying" notifications and
  // never throw errors to block the user.
  onlyWarning: false,

  // Free trial days
  freeTrial: 31,
});
~~~

If you don't feel comfortable forcing your users to purchase an activation key and you'd rather trust that your users will do the "right" thing, then you can set `onlyWarning: true` which will ensure that nothing annoying happens for your users. No `window.alert()`, no `throw`, no `process.exit()`, etc.

Depending on how you have set up your free-tier, you may want to adjust `numberOfAuthors`.
For example, if your code is free for companies with <70 software developers, then you may want to increase `numberOfAuthors` to something like `5`.
Or, if your code is free only for companies with <5 software developers, you may want to decrease `numberOfAuthors` to like `2`.

<br/>

