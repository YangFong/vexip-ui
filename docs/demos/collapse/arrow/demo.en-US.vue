<template>
  <Collapse v-model:expanded="expanded" arrow-type="left">
    <CollapsePanel title="Panel 1">
      <p>Some content to fill</p>
      <p>Some content to fill</p>
    </CollapsePanel>
    <CollapsePanel title="Panel 2">
      <p>Some content to fill</p>
      <p>Some content to fill</p>
    </CollapsePanel>
    <CollapsePanel title="Panel 3">
      <p>Some content to fill</p>
      <p>Some content to fill</p>
    </CollapsePanel>
  </Collapse>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const expanded = ref(0)
</script>

<style scoped>
.vxp-collapse {
  max-width: 500px;
}
</style>
