<template>
  <Input v-model:value="filter"></Input>
  <Tree :data="data" :filter="filter"></Tree>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const filter = ref('')
const data = [
  {
    id: 1,
    label: '动物',
    parent: 0,
    expanded: true
  },
  {
    id: 2,
    label: '鸟类',
    parent: 5
  },
  {
    id: 3,
    label: '无脊椎动物',
    parent: 1
  },
  {
    id: 4,
    label: '哺乳动物',
    parent: 5
  },
  {
    id: 5,
    label: '脊椎动物',
    parent: 1
  },
  {
    id: 6,
    label: '喜鹊',
    parent: 2
  },
  {
    id: 7,
    label: '蚯蚓',
    parent: 3
  }
]
</script>

<style scoped>
.vxp-input {
  max-width: 400px;
}
</style>
