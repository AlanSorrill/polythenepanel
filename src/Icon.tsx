import { MaterialSymbol } from './Imports'
import React from 'react'

export interface Icon_Props { 
    symbol: MaterialSymbol
    style?: React.CSSProperties
    className?: string
}
export interface Icon_State { }
export class Icon extends React.Component<Icon_Props, Icon_State>{
    constructor(props: Icon_Props) {
        super(props);
    }
    render() {
        return <div className={`material-symbols-outlined${typeof this.props.className == 'string' ? ' ' + this.props.className : ''}`} style={this.props.style}>{this.props.symbol}</div>
    }
}