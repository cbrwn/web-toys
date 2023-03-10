<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');

@media (prefers-color-scheme: dark) {
  body {
    background-color: rgb(30, 41, 59);
    color: white;
  }
}

@media (prefers-color-scheme: light) {
  body {
    background-color: rgb(218, 221, 230);
  }
}

body {
  font-family: 'Itim', cursive, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
</style>