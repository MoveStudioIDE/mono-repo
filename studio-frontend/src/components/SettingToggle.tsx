

export default function SettingToggle (
  props: {
    label: string,
    checked: boolean,
    onChange: (event: any) => void,
    disabled?: boolean,
    tooltip?: string,
    new?: boolean
  }
) {
  return (
    <div className="form-control">
      <label className="label cursor-pointer">
        <span className="label-text text-xs break-words p-1">
          {props.label}
          {props.new && <span className="badge badge-outline badge-accent ml-2">New</span>}
        </span> 
        { 
          props.tooltip && 
          <div className="tooltip tooltip-info tooltip-right" data-tip={props.tooltip}>
            <input type="checkbox" className="toggle toggle-xs toggle-warning" checked={props.checked} onChange={props.onChange} disabled={props.disabled}/>
          </div>
        }
        {
          !props.tooltip &&
          <input type="checkbox" className="toggle toggle-xs toggle-warning" checked={props.checked} onChange={props.onChange} disabled={props.disabled}/>
        }
        
      </label>
    </div>
  )
}