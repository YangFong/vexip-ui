export interface TransferKeyConfig {
  value?: string,
  label?: string,
  disabled?: string
}

export interface TransferOptionState {
  value: string | number,
  label: string,
  disabled: boolean,
  hidden: boolean,
  hitting: boolean,
  data: string | Record<string, any>
}

export interface TransferExposed {
  handleToTarget: () => void,
  handleToSource: () => void,
  handlePanelFocus: (type: 'source' | 'target') => void,
  handlePanelBlur: () => void
}
