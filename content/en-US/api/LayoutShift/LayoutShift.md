---
recipe: api-feature
title: 'LayoutShift'
mdn_url: /en-US/docs/Web/API/LayoutShift
specifications: https://wicg.github.io/layout-instability/#layoutshift
browser_compatibility: api.LayoutShift
---

## Description

The `LayoutShift` interface of the Layout Instability API provides insights into the stability of web pages based on movements of the elements on the page.

## Properties

**`LayoutShift.value`**

Returns the `impact fraction` (fraction of the viewport that was shifted) times the `distance fraction` (distance moved as a fraction of viewport).

**`LayoutShift.hadRecentInput`**

Returns `true` if there was a user input in the past 500 milliseconds.

**`LayoutShift.lastInputTime`**

Returns the time of the most recent user input.

**`LayoutShift.sources`**

Returns an array of {{domxref('LayoutShiftAttribution')}} objects with information on the elements that were shifted.

## Methods

**`LayoutShift.toJSON()`**

Converts the properties to JSON.

## Examples

The following example shows how to capture layout shifts and log them to the console.

Note that in this example data is only sent to the server when the user leaves the tab.

```js
// Catch errors since some browsers throw when using the new `type` option.
// https://bugs.webkit.org/show_bug.cgi?id=209216
try {
  let cumulativeLayoutShiftScore = 0;

  const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Only count layout shifts without recent user input.
    if (!entry.hadRecentInput) {
      cumulativeLayoutShiftScore += entry.value;
    }
  }
  });

  observer.observe({type: 'layout-shift', buffered: true});

  document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    // Force any pending records to be dispatched.
    observer.takeRecords();
    observer.disconnect();

    console.log('CLS:', cumulativeLayoutShiftScore);
  }
  });
} catch (e) {
  // Do nothing if the browser doesn't support this API.
}
```
