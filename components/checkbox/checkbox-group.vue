<template>
  <div :id="idFor" :class="className" role="group">
    <slot>
      <Checkbox v-if="props.control" control>
        {{ controlLabel }}
      </Checkbox>
      <template v-for="(item, index) in props.options" :key="index">
        <Checkbox v-if="isObject(item)" :value="item.value" :control="item.control">
          {{ item.label || item.value }}
        </Checkbox>
        <Checkbox v-else :value="item">
          {{ item }}
        </Checkbox>
      </template>
    </slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, toRef, computed, watch, provide } from 'vue'
import { Checkbox } from '@/components/checkbox'
import {
  useNameHelper,
  useProps,
  useLocale,
  booleanProp,
  booleanStringProp,
  sizeProp,
  stateProp,
  createSizeProp,
  createStateProp,
  eventProp,
  emitEvent
} from '@vexip-ui/config'
import { useFieldStore } from '@/components/form'
import { isDefined, isObject, debounceMinor } from '@vexip-ui/utils'
import { GROUP_STATE } from './symbol'

import type { PropType, Ref } from 'vue'
import type { ControlState } from './symbol'

type RawOption =
  | string
  | {
      value: string | number,
      label?: string,
      control?: boolean
    }
type Values = (string | number)[]

export default defineComponent({
  name: 'CheckboxGroup',
  components: {
    Checkbox
  },
  props: {
    size: sizeProp,
    state: stateProp,
    value: Array as PropType<Values>,
    vertical: booleanProp,
    disabled: booleanProp,
    border: booleanProp,
    options: Array as PropType<RawOption[]>,
    loading: booleanProp,
    loadingLock: booleanProp,
    control: booleanStringProp,
    onChange: eventProp<(value: Values) => void>()
  },
  emits: ['update:value'],
  setup(_props, { emit }) {
    const { idFor, state, disabled, loading, size, validateField, getFieldValue, setFieldValue } =
      useFieldStore<Values>(() => Array.from(inputSet)[0]?.value?.focus())

    const props = useProps('checkboxGroup', _props, {
      size: createSizeProp(size),
      state: createStateProp(state),
      value: {
        default: () => getFieldValue([]),
        static: true
      },
      vertical: false,
      disabled: () => disabled.value,
      border: false,
      options: {
        default: () => [],
        static: true
      },
      loading: () => loading.value,
      control: null,
      loadingLock: false
    })

    const nh = useNameHelper('checkbox-group')
    const locale = useLocale('checkbox')
    const valueMap = new Map<string | number, boolean>()
    const inputSet = new Set<Ref<HTMLElement | null | undefined>>()
    const controlSet = new Set<ControlState>()
    const currentValues = ref<Values>(props.value || [])

    const className = computed(() => {
      return [
        nh.b(),
        nh.ns('checkbox-vars'),
        {
          [nh.bm('vertical')]: props.vertical,
          [nh.bm('disabled')]: props.disabled,
          [nh.bm('loading')]: props.loading && props.loadingLock,
          [nh.bm(props.size)]: props.size !== 'default',
          [nh.bm('border')]: props.border,
          [nh.bm(props.state)]: props.state !== 'default'
        }
      ]
    })
    const controlLabel = computed(() => {
      return typeof props.control === 'string' ? props.control : locale.value.all
    })

    const updateValue = debounceMinor(() => {
      currentValues.value = []

      valueMap.forEach((checked, value) => {
        if (checked) {
          currentValues.value.push(value)
        }
      })

      handleChange(currentValues.value)
    })

    const updateControl = debounceMinor(() => {
      const valueLength = currentValues.value.length
      const checked = valueLength === valueMap.size
      const partial = valueLength > 0 && !checked

      controlSet.forEach(state => {
        state.checked = checked
        state.partial = partial
      })
    })

    provide(
      GROUP_STATE,
      reactive({
        currentValues,
        size: toRef(props, 'size'),
        state: toRef(props, 'state'),
        disabled: toRef(props, 'disabled'),
        loading: toRef(props, 'loading'),
        loadingLock: toRef(props, 'loadingLock'),
        increaseItem,
        decreaseItem,
        increaseControl,
        decreaseControl,
        handleControlChange,
        setItemChecked,
        replaceValue
      })
    )

    watch(
      () => props.value,
      value => {
        const checkedValues = new Set(value)
        const allValues = Array.from(valueMap.keys())

        currentValues.value = []

        allValues.forEach(value => {
          const checked = checkedValues.has(value)

          valueMap.set(value, checkedValues.has(value))
          checked && currentValues.value.push(value)
        })
      }
    )
    watch(currentValues, () => {
      updateControl()
    })

    function increaseItem(
      value: string | number,
      checked: boolean,
      input: Ref<HTMLElement | null | undefined>
    ) {
      valueMap.set(value, checked)
      inputSet.add(input)
    }

    function decreaseItem(value: string | number, input: Ref<HTMLElement | null | undefined>) {
      valueMap.delete(value)
      inputSet.delete(input)
    }

    function increaseControl(state: ControlState) {
      controlSet.add(state)
      updateControl()
    }

    function decreaseControl(state: ControlState) {
      controlSet.delete(state)
    }

    function setItemChecked(value: string | number, checked: boolean) {
      if (!isDefined(value) || !valueMap.has(value)) return

      valueMap.set(value, checked)
      updateValue()
      updateControl()
    }

    function handleControlChange() {
      // 在 group 层进行更新, 未选满则全选, 反之全不选
      const allValues = Array.from(valueMap.keys())
      const checked = currentValues.value.length !== allValues.length

      allValues.forEach(value => {
        valueMap.set(value, checked)
      })

      updateValue()
      updateControl()
    }

    function handleChange(value: Values) {
      setFieldValue(value)
      emitEvent(props.onChange, value)
      emit('update:value', value)
      validateField()
    }

    function replaceValue(prevValue: string | number, newValue: string | number) {
      if (
        isDefined(prevValue) &&
        isDefined(newValue) &&
        prevValue !== newValue &&
        valueMap.has(prevValue)
      ) {
        valueMap.set(newValue, valueMap.get(prevValue)!)
        valueMap.delete(prevValue)
      }
    }

    return {
      props,
      idFor,
      className,
      controlLabel,

      isObject,
      increaseControl,
      decreaseControl
    }
  }
})
</script>
