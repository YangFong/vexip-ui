<template>
  <li
    ref="wrapper"
    :class="className"
    role="menuitem"
    tabindex="0"
    @click="handleSelect"
  >
    <slot></slot>
  </li>
</template>

<script lang="ts">
import { defineComponent, ref, computed, toRef, inject } from 'vue'
import { useNameHelper, eventProp, emitEvent } from '@vexip-ui/config'
import { useLabel } from './hooks'
import { SELECT_HANDLER } from './symbol'

export default defineComponent({
  name: 'DropdownItem',
  props: {
    label: {
      type: [String, Number],
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Boolean,
      default: false
    },
    divided: {
      type: Boolean,
      default: false
    },
    reference: {
      type: Boolean,
      default: false
    },
    meta: {
      type: Object,
      default: () => ({})
    },
    onSelect: eventProp<(label: string | number) => void>()
  },
  emits: [],
  setup(props) {
    const parentSelectHandler = inject(SELECT_HANDLER, null)

    const nh = useNameHelper('dropdown')
    const wrapper = ref(null)
    const label = toRef(props, 'label')
    const isReference = ref(props.reference)

    const currentLabel = useLabel(label, wrapper)

    const className = computed(() => {
      const baseClass = nh.be('item')

      return {
        [baseClass]: true,
        [`${baseClass}--disabled`]: props.disabled,
        [`${baseClass}--selected`]: !props.disabled && props.selected,
        [`${baseClass}--divided`]: props.divided
      }
    })

    function handleSelect() {
      if (props.disabled || isReference.value) {
        return
      }

      if (typeof parentSelectHandler === 'function') {
        parentSelectHandler([currentLabel.value!], [props.meta || {}])
      }

      emitEvent(props.onSelect!, currentLabel.value!)
    }

    return {
      wrapper,

      className,

      handleSelect
    }
  }
})
</script>
