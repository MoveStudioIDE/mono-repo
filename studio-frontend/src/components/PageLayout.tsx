

function PageLayout(
  props: {
    header: JSX.Element,
    sidebar: JSX.Element,
    canvas: JSX.Element
  }
) {
  return (
    <div 
      style={{display: "grid", gridTemplateColumns: "auto", gridTemplateRows: "70px auto"}}
      className="h-screen w-screen"
    >
      <div className="col-span-full row-span-1 border-b border-primary">
        {props.header}
      </div>
      <div 
        style={{display: "grid", gridTemplateColumns: "20% auto", gridTemplateRows: "auto"}}
        className="col-span-full row-span-1"
      >
        <div
          className="col-span-1 border-r border-secondary"
        >
          {props.sidebar}
        </div>
        <div 
          className="col-span-1 border-l border-secondary"
        >
          {props.canvas}
        </div>
      </div>
    </div>
  )
}

export default PageLayout