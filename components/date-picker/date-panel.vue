<template>
  <div :class="nh.be('panel')" @click="handleClick">
    <div v-if="shortcuts.length" :class="[nh.be('list'), nh.bem('list', 'sub')]">
      <div
        v-for="(item, index) in shortcuts"
        :key="index"
        :class="nh.be('shortcut')"
        :title="item.name"
        @click="handleShortcut(index)"
      >
        {{ item.name }}
      </div>
    </div>
    <div :class="nh.be('list')">
      <div style="display: flex;">
        <div>
          <div :class="nh.be('header')">
            <div :class="[nh.be('arrow'), nh.be('prev-year')]" @click="handleDoublePrevClick">
              <Icon><AnglesLeft></AnglesLeft></Icon>
            </div>
            <div
              v-show="currentPane === 'date'"
              :class="[nh.be('arrow'), nh.be('prev-month')]"
              @click="adjustCalendar('month', -1)"
            >
              <Icon><AngleLeft></AngleLeft></Icon>
            </div>
            <div key="year" :class="nh.be('year')" @click.stop="togglePane('year')">
              <template v-if="currentPane === 'year'">
                {{ `${yearRange[0]}${locale.year} - ${yearRange[9]}${locale.year}` }}
              </template>
              <template v-else>
                {{ `${calendarYear}${locale.year}` }}
              </template>
            </div>
            <div
              v-show="currentPane === 'date'"
              :class="nh.be('month')"
              @click.stop="togglePane('month')"
            >
              {{ getMonthLabel(calendarMonth) }}
            </div>
            <div
              v-show="currentPane === 'date'"
              :class="[nh.be('arrow'), nh.be('next-month')]"
              @click="adjustCalendar('month', 1)"
            >
              <Icon><AngleRight></AngleRight></Icon>
            </div>
            <div :class="[nh.be('arrow'), nh.be('next-year')]" @click="handleDoubleNextClick">
              <Icon><AnglesRight></AnglesRight></Icon>
            </div>
          </div>
          <div ref="calendar" :class="nh.be('calendar')">
            <div
              v-if="currentPane === 'year'"
              :class="nh.be('year-pane')"
              @mouseleave="hoveredYear = 0"
            >
              <div
                v-for="(item, index) in yearRange"
                :key="index"
                :class="{
                  [nh.be('year-item')]: true,
                  [nh.bem('year-item', 'selected')]: isSelectedYear(item),
                  [nh.bem('year-item', 'next')]: index > 9,
                  [nh.bem('year-item', 'disabled')]: isDisabledYear(item),
                  [nh.bem('year-item', 'in-range')]: isYearInRange(item)
                }"
                @click.stop="handleSelectYear(item)"
                @mouseenter="handleYearHover(item)"
              >
                <div :class="nh.be('year-label')">
                  <div :class="nh.be('year-label-inner')">
                    {{ item }}
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else-if="currentPane === 'month'"
              :class="nh.be('month-pane')"
              @mouseleave="hoveredMonth = 0"
            >
              <div
                v-for="index in monthRange"
                :key="index"
                :class="{
                  [nh.be('month-item')]: true,
                  [nh.bem('month-item', 'selected')]: isSelectedMonth(index),
                  [nh.bem('month-item', 'disabled')]: isDisabledMonth(index),
                  [nh.bem('month-item', 'in-range')]: isMonthInRange(index)
                }"
                @click.stop="handleSelectMonth(index)"
                @mouseenter="handleMonthHover(index)"
              >
                <div :class="nh.be('month-label')">
                  <div :class="nh.be('month-label-inner')">
                    {{ getMonthLabel(index) }}
                  </div>
                </div>
              </div>
            </div>
            <CalendarPanel
              v-else
              :value="calendarValue"
              :year="calendarYear"
              :month="calendarMonth"
              :disabled-date="disabledDate"
              :is-range="calendarRange"
              :value-type="valueType"
              @select="handleSelectDate"
              @hover="handleHoverDate"
            ></CalendarPanel>
          </div>
        </div>
        <div v-if="isDatetime" :class="nh.be('time-wheel')">
          <div :class="nh.be('header')"></div>
          <TimeWheel
            :hour="dateValue.hour"
            :minute="dateValue.minute"
            :second="dateValue.second"
            :candidate="3"
            :steps="steps"
            @toggle-col="toggleColumn"
            @change="emitChange"
          ></TimeWheel>
        </div>
      </div>
      <div v-if="!noAction" :class="nh.be('action')">
        <Button text size="small" @click="handleCancel">
          {{ cancelText || locale.cancel }}
        </Button>
        <Button type="primary" size="small" @click="handleConfirm">
          {{ confirmText || locale.confirm }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { Button } from '@/components/button'
import { CalendarPanel } from '@/components/calendar-panel'
import { Icon } from '@/components/icon'
import TimeWheel from './time-wheel.vue'
import { useHover } from '@vexip-ui/hooks'
import { useNameHelper, useLocale } from '@vexip-ui/config'
import { range, toDate } from '@vexip-ui/utils'
import { AngleRight, AngleLeft, AnglesRight, AnglesLeft } from '@vexip-ui/icons'
import { datePickerTypes } from './symbol'

import type { PropType } from 'vue'
import type { MonthIndex } from '@/components/calendar'
import type { Dateable } from '@vexip-ui/utils'
import type { DateType, DateTimeType, DatePickerType, DateShortcut } from './symbol'

export default defineComponent({
  name: 'DatePanel',
  components: {
    Button,
    CalendarPanel,
    Icon,
    TimeWheel,
    AngleRight,
    AngleLeft,
    AnglesRight,
    AnglesLeft
  },
  props: {
    type: {
      default: 'date' as DatePickerType,
      validator: (value: DatePickerType) => {
        return datePickerTypes.includes(value)
      }
    },
    enabled: {
      type: Object as PropType<Record<DateTimeType, boolean>>,
      default: () => ({})
    },
    startValue: {
      type: Object as PropType<Record<DateTimeType, number>>,
      default: () => ({})
    },
    endValue: {
      type: Object as PropType<Record<DateTimeType, number>>,
      default: () => ({})
    },
    valueType: {
      type: String as PropType<'start' | 'end'>,
      default: 'start'
    },
    shortcuts: {
      type: Array as PropType<DateShortcut[]>,
      default: () => []
    },
    column: {
      type: String as PropType<DateTimeType>,
      default: 'date'
    },
    confirmText: {
      type: String,
      default: null
    },
    cancelText: {
      type: String,
      default: null
    },
    today: {
      type: [Number, String, Date] as PropType<Dateable>,
      default: () => new Date()
    },
    disabledDate: {
      type: Function as PropType<(date: Date) => boolean>,
      default: () => false
    },
    noAction: {
      type: Boolean,
      default: false
    },
    steps: {
      type: Array as PropType<number[]>,
      default: () => [1, 1, 1]
    },
    isRange: {
      type: Boolean,
      default: false
    },
    startActivated: {
      type: Object as PropType<Record<DateTimeType, boolean>>,
      default: () => ({})
    },
    endActivated: {
      type: Object as PropType<Record<DateTimeType, boolean>>,
      default: () => ({})
    }
  },
  emits: ['click', 'shortcut', 'toggle-col', 'change', 'cancel', 'confirm', 'hover', 'type-change'],
  setup(props, { emit }) {
    const today = toDate(props.today)

    const currentPane = ref<DateType>('date')
    const calendarYear = ref(today.getFullYear())
    const calendarMonth = ref(today.getMonth() + 1) // 1 ~ 12
    const hoveredYear = ref(0) // 0 = false
    const hoveredMonth = ref(0) // 0 = false
    const yearRange = ref<number[]>([])

    const calendar = ref<HTMLElement>()

    const { isHover } = useHover(calendar)

    const locale = computed(() => {
      return { ...useLocale('calendar').value, ...useLocale('datePicker').value }
    })

    const startActivated = computed(() => {
      const activated = props.startActivated

      return activated.year && activated.month && activated.date
    })
    const endActivated = computed(() => {
      const activated = props.endActivated

      return activated.year && activated.month && activated.date
    })

    const isDatetime = computed(() => {
      return props.type === 'datetime'
    })
    const dateValue = computed(() => {
      return props.valueType === 'start' ? props.startValue : props.endValue
    })
    const activated = computed(() => {
      return props.valueType === 'start' ? props.startActivated : props.endActivated
    })
    const calendarRange = computed(() => {
      return (
        props.isRange &&
        ((props.valueType === 'start' && endActivated.value) ||
          (props.valueType === 'end' && startActivated.value))
      )
    })
    const calendarValue = computed(() => {
      return calendarRange.value
        ? [
            startActivated.value ? getStringValue('start') : '',
            endActivated.value ? getStringValue('end') : ''
          ]
        : props.valueType === 'start'
          ? startActivated.value
            ? getStringValue(props.valueType)
            : ''
          : endActivated.value
            ? getStringValue(props.valueType)
            : ''
    })

    watch(
      () => props.column,
      value => {
        if (value === 'year' || value === 'month' || value === 'date') {
          currentPane.value = value
          refreshCalendar()
        }
      },
      { immediate: true }
    )
    watch(
      calendarYear,
      value => {
        yearRange.value = range(12, Math.floor(value / 10) * 10, 1)
      },
      { immediate: true }
    )
    watch(isHover, value => {
      if (value) {
        toggleColumn(currentPane.value)
      }
    })

    function getStringValue(type: 'start' | 'end') {
      const value = type === 'start' ? props.startValue : props.endValue

      return `${value.year}-${value.month}-${value.date}`
    }

    function getMonthLabel(index: number) {
      return locale.value[`month${index as MonthIndex}`]
    }

    function togglePane(type: DateType) {
      currentPane.value = type

      toggleColumn(type)
    }

    function adjustCalendar(type: 'year' | 'month', amount: number) {
      if (type === 'year') {
        calendarYear.value += amount
      } else {
        // 月份存在进位
        calendarMonth.value += amount

        const date = new Date(calendarYear.value, calendarMonth.value - 1, 1)

        calendarYear.value = date.getFullYear()
        calendarMonth.value = date.getMonth() + 1
      }
    }

    function handleClick(event: MouseEvent) {
      emit('click', event)
    }

    function handleShortcut(index: number) {
      let { value, name } = props.shortcuts[index]

      if (typeof value === 'function') {
        value = value()
      }

      emit('shortcut', name, value)
    }

    function handleSelectDate(date: Date) {
      emitChange('year', date.getFullYear())
      emitChange('month', date.getMonth() + 1)
      emitChange('date', date.getDate())
    }

    function handleSelectYear(year: number) {
      if (isDisabledYear(year)) return

      calendarYear.value = year
      emitChange('year', year)

      if (props.type !== 'year') {
        togglePane('month')
      }
    }

    function handleSelectMonth(month: number) {
      if (isDisabledMonth(month)) return

      calendarMonth.value = month
      emitChange('year', calendarYear.value)
      emitChange('month', month)

      if (props.type !== 'month') {
        togglePane('date')
      }
    }

    function toggleColumn(type: DateTimeType) {
      emit('toggle-col', type)
    }

    function emitChange(type: DateTimeType, value: number) {
      emit('change', type, value)
    }

    function handleDoublePrevClick() {
      if (currentPane.value === 'year') {
        yearRange.value = range(12, yearRange.value[0] - 10, 1)
      } else {
        adjustCalendar('year', -1)
      }
    }
    function handleDoubleNextClick() {
      if (currentPane.value === 'year') {
        yearRange.value = range(12, yearRange.value[10], 1)
      } else {
        adjustCalendar('year', 1)
      }
    }

    function handleCancel() {
      emit('cancel')
    }

    function handleConfirm() {
      emit('confirm')
    }

    function handleHoverDate(date: Date | null) {
      emit('hover', date)
    }

    function isSelectedYear(year: number) {
      if (!year) return false

      return (
        (props.startActivated.year && props.startValue.year === year) ||
        (props.endActivated.year && props.endValue.year === year)
      )
    }

    function isSelectedMonth(month: number) {
      if (!month) return false

      const monthYear = 100 * calendarYear.value + month

      return (
        (props.startActivated.month &&
          100 * props.startValue.year + props.startValue.month === monthYear) ||
        (props.endActivated.month && 100 * props.endValue.year + props.endValue.month === monthYear)
      )
    }

    function isDisabledYear(year: number) {
      if (!props.isRange) return false

      if (props.valueType === 'end' && props.startActivated.year && year < props.startValue.year) {
        return true
      }

      if (props.valueType === 'start' && props.endActivated.year && props.endValue.year < year) {
        return true
      }

      return false
    }

    function isDisabledMonth(month: number) {
      if (!props.isRange) return false

      const monthYear = calendarYear.value * 100 + month

      if (
        props.valueType === 'end' &&
        props.startActivated.month &&
        monthYear < 100 * props.startValue.year + props.startValue.month
      ) {
        return true
      }

      if (
        props.valueType === 'start' &&
        props.endActivated.month &&
        monthYear > 100 * props.endValue.year + props.endValue.month
      ) {
        return true
      }

      return false
    }

    function handleYearHover(year: number) {
      hoveredYear.value = isDisabledYear(year) ? 0 : year
    }

    function handleMonthHover(month: number) {
      hoveredMonth.value = isDisabledMonth(month) ? 0 : month
    }

    function isYearInRange(year: number) {
      if (
        !calendarRange.value ||
        (!hoveredYear.value && !props.startActivated.year && !props.endActivated.year)
      ) {
        return false
      }

      if (
        (props.valueType === 'start' && !props.endActivated.year) ||
        (props.valueType === 'end' && !props.startActivated.year)
      ) {
        return false
      }

      const startYear = props.startValue.year
      const endYear = props.endValue.year

      let min: number
      let max: number

      if (!hoveredYear.value && props.startActivated.year && props.endActivated.year) {
        min = Math.min(startYear, endYear)
        max = Math.max(startYear, endYear)
      } else if (hoveredYear.value) {
        if (!props.startActivated.year && !props.endActivated.year) return false

        if (!props.startActivated.year || !props.endActivated.year) {
          const selectedYear = props.startActivated.year ? startYear : endYear

          min = Math.min(hoveredYear.value, selectedYear)
          max = Math.max(hoveredYear.value, selectedYear)
        } else {
          const minYear = Math.min(startYear, endYear)
          const maxYear = Math.max(startYear, endYear)

          min = Math.min(hoveredYear.value, minYear)
          max = Math.max(hoveredYear.value, maxYear)
        }
      } else {
        return false
      }

      return year >= min && year <= max
    }

    function isMonthInRange(month: number) {
      if (
        !calendarRange.value ||
        (!hoveredMonth.value && !props.startActivated.month && !props.endActivated.month)
      ) {
        return false
      }

      if (
        (props.valueType === 'start' && !props.endActivated.month) ||
        (props.valueType === 'end' && !props.startActivated.month)
      ) {
        return false
      }

      const startMonthYear = 100 * props.startValue.year + props.startValue.month
      const endMonthYear = 100 * props.endValue.year + props.endValue.month

      let min: number
      let max: number

      if (!hoveredMonth.value && props.startActivated.month && props.endActivated.month) {
        min = Math.min(startMonthYear, endMonthYear)
        max = Math.max(startMonthYear, endMonthYear)
      } else if (hoveredMonth.value) {
        if (!props.startActivated.month && !props.endActivated.month) return false

        const hoveredMonthYear = 100 * calendarYear.value + hoveredMonth.value

        if (!props.startActivated.month || !props.endActivated.month) {
          const selectedMonthYear = props.startActivated.month ? startMonthYear : endMonthYear

          min = Math.min(hoveredMonthYear, selectedMonthYear)
          max = Math.max(hoveredMonthYear, selectedMonthYear)
        } else {
          const minMonthYear = Math.min(startMonthYear, endMonthYear)
          const maxMonthYear = Math.max(startMonthYear, endMonthYear)

          min = Math.min(hoveredMonthYear, minMonthYear)
          max = Math.max(hoveredMonthYear, maxMonthYear)
        }
      } else {
        return false
      }

      const monthYear = 100 * calendarYear.value + month

      return monthYear >= min && monthYear <= max
    }

    // 重新计算日历页面
    function refreshCalendar() {
      const today = toDate(props.today)

      if (props.valueType === 'start') {
        calendarYear.value = props.startActivated.year ? props.startValue.year : today.getFullYear()
        calendarMonth.value = props.startActivated.month
          ? props.startValue.month
          : today.getMonth() + 1
      } else {
        calendarYear.value = props.endActivated.year ? props.endValue.year : today.getFullYear()
        calendarMonth.value = props.endActivated.month ? props.endValue.month : today.getMonth() + 1
      }
    }

    return {
      nh: useNameHelper('date-picker'),
      locale,
      currentPane,
      calendarYear,
      calendarMonth,
      yearRange,
      monthRange: range(12, 1, 1),
      hoveredYear,
      hoveredMonth,

      isDatetime,
      dateValue,
      activated,
      calendarValue,
      calendarRange,

      calendar,

      getMonthLabel,
      togglePane,
      adjustCalendar,
      handleClick,
      handleShortcut,
      handleSelectDate,
      handleSelectYear,
      handleSelectMonth,
      toggleColumn,
      emitChange,
      handleDoublePrevClick,
      handleDoubleNextClick,
      handleCancel,
      handleConfirm,
      handleHoverDate,
      isSelectedYear,
      isSelectedMonth,
      isDisabledYear,
      isDisabledMonth,
      handleYearHover,
      handleMonthHover,
      isYearInRange,
      isMonthInRange,

      refreshCalendar
    }
  }
})
</script>
