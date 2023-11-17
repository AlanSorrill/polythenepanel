import { } from './Imports'
import React from 'react'

export interface NoSelect_Props {
    children: React.ReactNode
 }
export interface NoSelect_State { }
export class NoSelect extends React.Component<NoSelect_Props, NoSelect_State>{
    constructor(props: NoSelect_Props) {
        super(props);
    }
    render() {
        return <span style={{
            '-webkit-user-select': 'none', /* Safari */
            '-moz-user-select': 'none', /* Firefox */
            '-ms-user-select': 'none', /* IE10+/Edge */
            'user-select': 'none', /* Standard */
        } as any}>{this.props.children}</span>
    }
}