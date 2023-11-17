import { NoSelect, PolytheneRouter } from './Imports'
import React from 'react'


export interface PanelList_Props {
    onSelected: (panelName: `${string}.${string}`) => void
    style?: React.CSSProperties
}
export interface PanelList_State {
    panelNames: Array<`${string}.${string}`>
}
export class PanelList extends React.Component<PanelList_Props, PanelList_State>{
    constructor(props: PanelList_Props) {
        super(props);
        this.state = {
            panelNames: Array.from(PolytheneRouter._constructorMap.keys())
        }

    }
    render() {
        let ths = this;
        return <div style={ths.props.style}>{this.state.panelNames.map((panelName) => (<PanelListItem key={panelName} panelName={panelName} onSelected={ths.props.onSelected} />))}</div>
    }
}

export interface PanelListItem_Props {
    panelName: `${string}.${string}`
    onSelected: (panelName: `${string}.${string}`) => void
}
export interface PanelListItem_State {
    packageName: string
    panelName: string
}
export class PanelListItem extends React.Component<PanelListItem_Props, PanelListItem_State>{
    constructor(props: PanelListItem_Props) {
        super(props);
        let parts = props.panelName.split('.');
        this.state = {
            packageName: parts[0],
            panelName: parts[1]
        }
    }
    render() {
        let ths = this;
        return <div style={{ padding: 4, backgroundColor: 'grey' }} onClick={()=>{
            ths.props.onSelected(ths.props.panelName)
        }}><NoSelect>{this.state.panelName}</NoSelect></div>
    }
}