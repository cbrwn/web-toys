<template>
  <div class="container mx-auto flex justify-center">
    <div class="flex flex-col w-full justify-center py-8 gap-y-3">
      <Header title="the wheel!">
      </Header>
      <ContentContainer>
        <WheelSpinner :items="items" />
      </ContentContainer>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'default',
  created() { document.title = 'the wheel.'; },
  data() {
    let initItems = ['cam', 'matt', 'darcy 1', 'darcy 2',
          'jeff',
          'bob',
          'jason',
          'aaron',
          'ben',
          'greg',
          'henry',
          'jake',
          'larry',
          'tom',
          'fred',
         ];
    if (process.client) {
      if (localStorage.wheelItems)
        initItems = JSON.parse(localStorage.wheelItems);
    }
    return {
      items: initItems
    };
  }
}
</script>