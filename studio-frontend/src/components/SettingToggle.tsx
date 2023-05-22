

export default function SettingToggle (
  props: {
    label: string,
    checked: boolean,
    onChange: (event: any) => void,
    disabled?: boolean
  }
) {
  return (
    <div className="form-control">
      <label className="label cursor-pointer">
        <span className="label-text text-xs break-words p-1">{props.label}</span> 
        <input type="checkbox" className="toggle toggle-xs toggle-warning" checked={props.checked} onChange={props.onChange} disabled={props.disabled}/>
      </label>
    </div>
  )
}