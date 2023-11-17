import { } from './Imports'
import React from 'react'
export interface ToolTip_Props {
    children: React.ReactNode,
    tip: React.ReactNode
}
export interface ToolTip_State { }
export class ToolTip extends React.Component<ToolTip_Props, ToolTip_State>{
    constructor(props: ToolTip_Props) {
        super(props);
    }
    render() {
        return <span className='tooltip'>
            <span key='content'>{this.props.children}</span>
            <span key='tip' className='tooltiptext' style={{
                backgroundColor: fColor.darkMode[11].toHexString(),
                color: fColor.lightText[1].toHexString(),
                borderRadius: 3,
                padding: 4
            }}>{this.props.tip}</span></span>
    }
}