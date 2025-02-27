<template>
  <div
    ref="wrapper"
    :class="[nh.b(), props.maxLines > 0 && nh.bm('multiple')]"
    :style="ellipsisStyle"
    v-bind="$attrs"
    @mouseenter="handleTriggerEnter"
    @mouseleave="handleTriggerLeave"
  >
    <slot></slot>
  </div>
  <Portal v-if="visible" :to="transferTo">
    <transition :name="props.transitionName" appear @after-leave="visible = false">
      <div
        v-show="active"
        ref="popper"
        :class="{
          [tooltipNh.be('popper')]: true,
          [tooltipNh.bs('vars')]: true,
          [tooltipNh.bem('popper', props.tooltipTheme)]: true,
          [tooltipNh.bem('popper', 'no-hover')]: props.noHover
        }"
        @click.stop
        @mouseenter="handleTriggerEnter"
        @mouseleave="handleTriggerLeave"
      >
        <div :class="[nh.be('tip'), tooltipNh.be('tip'), props.tipClass]" :style="tipStyle">
          <div :class="tooltipNh.be('arrow')"></div>
          {{ content }}
        </div>
      </div>
    </transition>
  </Portal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, toRef, nextTick } from 'vue'
import { Portal } from '@/components/portal'
import { useNameHelper, useProps, booleanProp, classProp } from '@vexip-ui/config'
import { placementWhileList, usePopper, useSetTimeout } from '@vexip-ui/hooks'
import { getRangeWidth } from '@vexip-ui/utils'

import type { PropType } from 'vue'
import type { Placement } from '@vexip-ui/hooks'
import type { TooltipTheme } from '@/components/tooltip'

export default defineComponent({
  name: 'Ellipsis',
  components: {
    Portal
  },
  props: {
    placement: String as PropType<Placement>,
    transfer: {
      type: [String, Boolean],
      default: null
    },
    noHover: booleanProp,
    transitionName: String,
    tooltipTheme: String as PropType<TooltipTheme>,
    tipClass: classProp,
    maxLines: Number,
    tipMaxWidth: [Number, String]
  },
  setup(_props) {
    const nh = useNameHelper('ellipsis')
    const props = useProps('ellipsis', _props, {
      placement: {
        default: 'top',
        validator: value => placementWhileList.includes(value)
      },
      transfer: 'body',
      noHover: false,
      transitionName: () => nh.ns('fade'),
      tooltipTheme: {
        default: 'dark',
        validator: value => ['light', 'dark'].includes(value)
      },
      tipClass: null,
      maxLines: null,
      tipMaxWidth: 500
    })

    const tooltipNh = useNameHelper('tooltip')
    const visible = ref(false)
    const active = ref(false)
    const placement = toRef(props, 'placement')
    const transfer = toRef(props, 'transfer')
    const content = ref('')

    const wrapper = ref<HTMLElement>()

    const { popper, transferTo, updatePopper } = usePopper({
      placement,
      transfer,
      wrapper,
      reference: wrapper
    })
    const ellipsisStyle = computed(() => {
      return props.maxLines > 0 ? { '-webkit-line-clamp': props.maxLines } : ''
    })
    const tipStyle = computed(() => {
      return {
        maxWidth:
          typeof props.tipMaxWidth === 'string'
            ? parseFloat(props.tipMaxWidth) || props.tipMaxWidth
            : `${props.tipMaxWidth}px`
      }
    })

    watch(visible, value => {
      if (value) {
        updatePopper()
      }
    })

    const { timer } = useSetTimeout()

    function handleTriggerEnter() {
      clearTimeout(timer.hover)

      timer.hover = setTimeout(() => {
        if (!wrapper.value || !wrapper.value.childNodes.length) {
          visible.value = false
          return
        }

        // In the case of multiple lines, use visual height and real content height to control whether to display
        if (props.maxLines > 0) {
          const scrollHeight = wrapper.value.scrollHeight
          const clientHeight = wrapper.value.clientHeight

          visible.value = scrollHeight > clientHeight
        } else {
          visible.value = getRangeWidth(wrapper.value) > wrapper.value.getBoundingClientRect().width
        }

        content.value = visible.value ? wrapper.value.textContent ?? '' : ''

        nextTick(() => {
          active.value = true
        })
      }, 250)
    }

    function handleTriggerLeave() {
      clearTimeout(timer.hover)

      timer.hover = setTimeout(() => {
        active.value = false
      })
    }

    return {
      props,
      nh,
      tooltipNh,
      visible,
      active,
      content,
      transferTo,

      ellipsisStyle,
      tipStyle,

      wrapper,
      popper,

      handleTriggerEnter,
      handleTriggerLeave
    }
  }
})
</script>
