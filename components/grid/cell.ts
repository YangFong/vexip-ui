import { defineComponent, reactive, computed, watch, h, inject } from 'vue'
import { useNameHelper, useProps } from '@vexip-ui/config'
import { isDefined, has } from '@vexip-ui/utils'
import { breakPoints, currentBreakPoint } from './helpler'
import { GRID_STATE } from './symbol'

import type { PropType, CSSProperties } from 'vue'
import type { BreakPoint } from './helpler'
import type { CellFlex, CellOptions } from './symbol'

const mediaProp = [Number, Object] as PropType<CellOptions>

export default defineComponent({
  name: 'Cell',
  props: {
    tag: String,
    top: [Number, String],
    left: [Number, String],
    width: Number,
    height: Number,
    right: [Number, String],
    bottom: [Number, String],
    xs: mediaProp,
    sm: mediaProp,
    md: mediaProp,
    lg: mediaProp,
    xl: mediaProp,
    xxl: mediaProp,
    useFlex: {
      type: [Boolean, Object] as PropType<boolean | Partial<CellFlex>>,
      default: null
    }
  },
  setup(_props, { slots }) {
    const props = useProps('cell', _props, {
      tag: 'div',
      top: 'auto',
      left: 'auto',
      width: null,
      height: 1,
      right: '',
      bottom: '',
      xs: null,
      sm: null,
      md: null,
      lg: null,
      xl: null,
      xxl: null,
      useFlex: null
    })

    const gridState = inject(GRID_STATE, null)

    const nh = useNameHelper('cell')

    const layoutState = reactive({
      top: props.top,
      right: props.right,
      bottom: props.bottom,
      left: props.left,
      width: props.width,
      height: props.height
    })
    const leyoutKeys = Object.keys(layoutState) as (
      | 'top'
      | 'right'
      | 'bottom'
      | 'left'
      | 'width'
      | 'height'
    )[]

    const defaultWidth = computed(() => {
      if (isDefined(props.width)) {
        return props.width
      }

      return gridState?.columns && typeof gridState.columns === 'number' ? gridState.columns : 1
    })

    watch(
      currentBreakPoint,
      value => {
        const matchSize = queryBreakPointOptions(value)

        if (matchSize) {
          if (typeof matchSize === 'number') {
            leyoutKeys.forEach(key => {
              layoutState[key] = props[key] as any
            })

            layoutState.width = matchSize
          } else {
            leyoutKeys.forEach(key => {
              layoutState[key] = has(matchSize, key) ? matchSize[key] : (props[key] as any)
            })

            layoutState.width = layoutState.width ?? defaultWidth.value
          }
        } else {
          leyoutKeys.forEach(key => {
            layoutState[key] = props[key] as any
          })

          layoutState.width = defaultWidth.value
        }
      },
      { immediate: true }
    )

    const className = computed(() => {
      const cellFelx = props.useFlex !== false &&
        (props.useFlex || gridState?.cellFlex) && {
        ...(gridState?.cellFlex || {}),
        ...(props.useFlex
          ? props.useFlex === true
            ? { justify: 'start', align: 'top' }
            : props.useFlex
          : {})
      }
      const className = {
        [nh.b()]: true,
        [nh.bm('flex')]: cellFelx
      }

      if (cellFelx) {
        if (cellFelx.justify) className[nh.bm(cellFelx.justify)] = true
        if (cellFelx.align) className[nh.bm(cellFelx.align)] = true
      }

      return className
    })
    const style = computed(() => {
      const style: CSSProperties = {}

      const topSet = isPositionSet(layoutState.top)
      const rightSet = isPositionSet(layoutState.right)
      const bottomSet = isPositionSet(layoutState.bottom)
      const leftSet = isPositionSet(layoutState.left)

      if (topSet && bottomSet) {
        style.gridRowStart = parsePosition(layoutState.top)
        style.gridRowEnd = parsePosition(layoutState.bottom)
      } else if (topSet) {
        style.gridRowStart = parsePosition(layoutState.top)
        style.gridRowEnd = `span ${layoutState.height}`
      } else if (bottomSet) {
        style.gridRowStart = `span ${layoutState.height}`
        style.gridRowEnd = parsePosition(layoutState.bottom)
      } else {
        style.gridRowEnd = `span ${layoutState.height}`
      }

      if (leftSet && rightSet) {
        style.gridColumnStart = parsePosition(layoutState.left)
        style.gridColumnEnd = parsePosition(layoutState.right)
      } else if (leftSet) {
        style.gridColumnStart = parsePosition(layoutState.left)
        style.gridColumnEnd = `span ${layoutState.width}`
      } else if (rightSet) {
        style.gridColumnStart = `span ${layoutState.width}`
        style.gridColumnEnd = parsePosition(layoutState.right)
      } else {
        style.gridColumnStart = `span ${layoutState.width}`
      }

      return style
    })

    function isPositionSet(value: number | string) {
      return value === 0 || (value && value !== 'auto')
    }

    function parsePosition(value: number | string) {
      return typeof value === 'number' ? value + 1 : value
    }

    function queryBreakPointOptions(breakPoint: BreakPoint) {
      const index = breakPoints.findIndex(v => v === breakPoint)

      if (~index) {
        for (let i = index; i >= 0; --i) {
          if (isDefined(props[breakPoints[i]])) {
            return props[breakPoints[i]]
          }
        }
      }

      return null
    }

    return () =>
      h(
        props.tag || 'div',
        {
          class: className.value,
          style: style.value
        },
        {
          default: () => slots.default?.()
        }
      )
  }
})
