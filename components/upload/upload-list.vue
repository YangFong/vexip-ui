<template>
  <ul :class="[nh.be('files'), nh.bs('vars')]" :style="props.style">
    <transition
      v-for="item in props.files"
      :key="item.id"
      appear
      :name="props.selectToAdd ? transitionName : undefined"
    >
      <UploadFile
        :file="item"
        :icon-renderer="props.iconRenderer"
        :list-type="props.type"
        :loading-text="props.loadingText"
        :select-to-add="props.selectToAdd"
        :precision="props.precision"
        :can-preview="props.canPreview"
        @delete="handleDelete"
        @preview="handlePreview"
      >
        <template #default="{ file, status, percentage }">
          <slot
            name="item"
            :file="file"
            :status="status"
            :percentage="percentage"
          ></slot>
        </template>
        <template #icon="{ file }">
          <slot name="icon" :file="file"></slot>
        </template>
      </UploadFile>
    </transition>
    <slot name="suffix"></slot>
  </ul>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { UploadFile } from '@/components/upload-file'
import {
  useNameHelper,
  useProps,
  booleanProp,
  styleProp,
  eventProp,
  emitEvent
} from '@vexip-ui/config'
import { uploadListTypes } from './symbol'

import type { PropType } from 'vue'
import type { UploadListType, RenderFn, FileState } from './symbol'

export default defineComponent({
  name: 'UploadList',
  components: {
    UploadFile
  },
  props: {
    files: Array as PropType<FileState[]>,
    selectToAdd: booleanProp,
    iconRenderer: Function as PropType<RenderFn>,
    type: String as PropType<UploadListType>,
    loadingText: String,
    style: styleProp,
    precision: Number,
    canPreview: Function as PropType<(file: FileState) => boolean>,
    onDelete: eventProp<(file: FileState) => void>(),
    onPreview: eventProp<(file: FileState) => void>()
  },
  emits: [],
  setup(_props) {
    const props = useProps('uploadList', _props, {
      files: {
        default: () => [],
        static: true
      },
      selectToAdd: false,
      iconRenderer: {
        default: null,
        isFunc: true
      },
      type: {
        default: 'name' as UploadListType,
        validator: (value: UploadListType) => uploadListTypes.includes(value)
      },
      loadingText: null,
      style: null,
      precision: 2
    })

    const nh = useNameHelper('upload')
    const transitionName = computed(() => nh.ns('fade'))

    function handleDelete(file: FileState) {
      emitEvent(props.onDelete, file)
    }

    function handlePreview(file: FileState) {
      emitEvent(props.onPreview, file)
    }

    return {
      props,
      nh,
      transitionName,

      handleDelete,
      handlePreview
    }
  }
})
</script>
